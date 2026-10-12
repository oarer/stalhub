#!/usr/bin/env python3
"""Run the genuine browser/API/DB stack in disposable local resources."""
import os
from pathlib import Path
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
import uuid

ROOT = Path(__file__).resolve().parents[1]
BACKEND = Path(os.environ.get('E2E_BACKEND_DIR', ROOT.parent / 'stalhub_backend')).resolve()
PORTS = (4310, 4311, 55432, 56379)


def main():
    if not (BACKEND / 'e2e/server.ts').is_file():
        raise SystemExit(f'Missing backend E2E launcher: {BACKEND}/e2e/server.ts')
    for port in PORTS:
        with socket.socket() as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind(('127.0.0.1', port))
            except OSError as error:
                raise SystemExit(f'E2E port {port} is occupied; no existing service will be reused') from error
    scratch = Path(tempfile.mkdtemp(prefix='stalhub-e2e-'))
    suffix = uuid.uuid4().hex[:10]
    containers = []
    processes = []
    logs = []
    env = dict(os.environ)
    # Never inherit application credentials into the child stack.
    for key in list(env):
        if key.startswith(('NEXT_PUBLIC_', 'S3_', 'SC_', 'EXBO_', 'DISCORD_', 'TELEGRAM_', 'OPENAI_', 'JWT_', 'DATABASE_', 'REDIS_', 'BUN_REDIS_', 'STALHUB_')):
            del env[key]
    env.update({
        'STALHUB_E2E': '1', 'NODE_ENV': 'development',
        'DATABASE_URL': 'postgresql://stalhub_e2e:stalhub_e2e@127.0.0.1:55432/stalhub_e2e',
        'REDIS_URL': 'redis://127.0.0.1:56379', 'BUN_REDIS_URL': 'redis://127.0.0.1:56379',
        'PORT': '4311', 'WEB_ORIGIN': 'http://localhost:4310',
        'E2E_WEB_ORIGIN': 'http://localhost:4310', 'E2E_API_ORIGIN': 'http://localhost:4311',
        'NEXT_PUBLIC_API': 'http://localhost:4311',
        'LAUNCHER_SOURCES': 'https://offline.invalid/launcher', 'LAUNCHER_AUTH_QUERY': 'offline',
        'OPENAI_API_KEY': 'offline-e2e-not-a-secret', 'JWT_SECRET': 'e2e-only-signing-key-not-for-production',
        'DOTENV_CONFIG_PATH': str(scratch / 'nonexistent.env'), 'NEXT_TELEMETRY_DISABLED': '1',
        'NEXT_FONT_GOOGLE_MOCKED_RESPONSES': str(ROOT / 'e2e/google-fonts.cjs'),
    })

    def run(args, cwd=ROOT, **kwargs):
        subprocess.run(args, cwd=cwd, env=env, check=True, **kwargs)

    def wait(check, label, timeout=90):
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            for child in processes:
                if child.poll() is not None:
                    raise RuntimeError(f'Server exited early ({child.returncode}); see {scratch}')
            try:
                if check():
                    return
            except (OSError, subprocess.SubprocessError):
                pass
            time.sleep(0.25)
        raise TimeoutError(f'{label} not ready; logs: {scratch}')

    def healthy(url):
        with urllib.request.urlopen(url, timeout=2) as response:
            return response.status == 200

    def start(args, cwd, name):
        log = (scratch / f'{name}.log').open('w')
        logs.append(log)
        child = subprocess.Popen(args, cwd=cwd, env=env, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        processes.append(child)

    try:
        for image in ('postgres:17-alpine', 'redis:7-alpine'):
            run(['docker', 'image', 'inspect', image], stdout=subprocess.DEVNULL)
        pg = f'stalhub-e2e-pg-{suffix}'
        run(['docker', 'run', '--rm', '-d', '--name', pg,
             '-p', '127.0.0.1:55432:5432', '--tmpfs', '/var/lib/postgresql/data',
             '-e', 'POSTGRES_USER=stalhub_e2e', '-e', 'POSTGRES_PASSWORD=stalhub_e2e',
             '-e', 'POSTGRES_DB=stalhub_e2e', 'postgres:17-alpine'])
        containers.append(pg)
        rd = f'stalhub-e2e-redis-{suffix}'
        run(['docker', 'run', '--rm', '-d', '--name', rd, '-p', '127.0.0.1:56379:6379',
             'redis:7-alpine', 'redis-server', '--save', '', '--appendonly', 'no'])
        containers.append(rd)
        wait(lambda: subprocess.run(['docker', 'exec', pg, 'pg_isready', '-U', 'stalhub_e2e'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0, 'PostgreSQL')
        wait(lambda: subprocess.run(['docker', 'exec', rd, 'redis-cli', 'ping'], capture_output=True).stdout.strip() == b'PONG', 'Redis')
        run(['bun', '--no-env-file', 'run', 'e2e/setup.ts'], cwd=BACKEND)
        start(['bun', '--no-env-file', 'run', 'e2e/server.ts'], BACKEND, 'backend')
        wait(lambda: healthy('http://localhost:4311/api/v1/health'), 'backend')
        # Next itself reads .env files, so start from a source copy without any.
        web = scratch / 'web'
        web.mkdir()
        shutil.copytree(ROOT / 'src', web / 'src')
        for name in ('public', 'node_modules'):
            (web / name).symlink_to(ROOT / name, target_is_directory=True)
        for name in ('package.json', 'tsconfig.json', 'next-env.d.ts', 'next.config.ts', 'postcss.config.mjs', 'postcss.config.js'):
            if (ROOT / name).is_file():
                shutil.copy2(ROOT / name, web / name)
        start(['bun', '--no-env-file', 'node_modules/next/dist/bin/next', 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', '4310'], web, 'frontend')
        wait(lambda: healthy('http://localhost:4310/api/health'), 'frontend', 120)
        run(['bun', '--no-env-file', 'x', '--no-install', 'playwright', 'test', *sys.argv[1:]])
        print(f'E2E passed. Server logs: {scratch}', flush=True)
    finally:
        for child in reversed(processes):
            if child.poll() is None:
                os.killpg(child.pid, signal.SIGTERM)
                try:
                    child.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    os.killpg(child.pid, signal.SIGKILL)
                    child.wait()
        for name in reversed(containers):
            subprocess.run(['docker', 'rm', '-f', name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for log in logs:
            log.close()
        # Retain only diagnostic logs, never credentials or a source copy.
        shutil.rmtree(scratch / 'web', ignore_errors=True)
        print(f'Disposable services removed. Logs: {scratch}', flush=True)


if __name__ == '__main__':
    main()
