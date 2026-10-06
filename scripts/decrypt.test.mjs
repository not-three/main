import assert from 'node:assert/strict';
import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const pwsh = process.env.PWSH || 'pwsh';
const scripts = new URL('./', import.meta.url).pathname;
const key = randomBytes(32);
const seed = key.toString('base64');
const partPlainSize = 5_242_816;

function encryptedPart(plaintext, badDigest = false) {
  const iv = randomBytes(16);
  const hash = createHash('sha256').update(plaintext).digest();
  if (badDigest) hash[0] ^= 1;
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([iv, cipher.update(Buffer.concat([hash, plaintext])), cipher.final()]);
}

function run(file, args, input = '') {
  return new Promise((resolve, reject) => {
    const child = spawn(pwsh, ['-NoProfile', '-File', join(scripts, file), ...args], { stdio: 'pipe' });
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', chunk => stdout.push(chunk));
    child.stderr.on('data', chunk => stderr.push(chunk));
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout: Buffer.concat(stdout), stderr: Buffer.concat(stderr).toString() }));
    child.stdin.end(input);
  });
}

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'not3-ps-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

test('note preserves UTF-8 and exact trailing newline from base64 response', async t => {
  const dir = await fixture(t);
  const source = join(dir, 'note.txt');
  const plaintext = Buffer.from('Grüße 🌍\n');
  await writeFile(source, encryptedPart(plaintext).toString('base64'));
  const result = await run('decrypt-note.ps1', [source, seed]);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(result.stdout, plaintext);
});

test('note supports URL and scriptblock invocation', async t => {
  const payload = encryptedPart(Buffer.from('from URL')).toString('base64');
  const server = createServer((_req, res) => res.end(payload));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const url = `http://127.0.0.1:${server.address().port}/note`;
  const command = `& ([scriptblock]::Create((Get-Content -Raw '${join(scripts, 'decrypt-note.ps1')}'))) '${url}' '${seed}'`;
  const result = await new Promise((resolve, reject) => {
    const child = spawn(pwsh, ['-NoProfile', '-Command', command]);
    const stdout = []; const stderr = [];
    child.stdout.on('data', x => stdout.push(x));
    child.stderr.on('data', x => stderr.push(x));
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout: Buffer.concat(stdout).toString(), stderr: Buffer.concat(stderr).toString() }));
  });
  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.stdout, 'from URL');
});

test('note rejects bad seed and checksum mismatch without plaintext', async t => {
  const dir = await fixture(t);
  const source = join(dir, 'note.txt');
  await writeFile(source, encryptedPart(Buffer.from('secret'), true).toString('base64'));
  const mismatch = await run('decrypt-note.ps1', [source, seed]);
  assert.notEqual(mismatch.code, 0);
  assert.match(mismatch.stderr, /checksum mismatch/i);
  assert.equal(mismatch.stdout.length, 0);
  const invalid = await run('decrypt-note.ps1', [source, 'bad']);
  assert.notEqual(invalid.code, 0);
  assert.match(invalid.stderr, /seed/i);
});

test('file decrypts full boundary part and short final part byte for byte', async t => {
  const dir = await fixture(t);
  const source = join(dir, 'file.enc');
  const output = join(dir, 'out.bin');
  const first = randomBytes(partPlainSize);
  const second = Buffer.from([0, 255, 1, 13, 10]);
  const encryptedFirst = encryptedPart(first);
  assert.equal(encryptedFirst.length, 5_242_880);
  await writeFile(source, Buffer.concat([encryptedFirst, encryptedPart(second)]));
  const result = await run('decrypt-file.ps1', [source, seed, output]);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(await readFile(output), Buffer.concat([first, second]));
});

test('file supports downloaded URL and scriptblock invocation', async t => {
  const dir = await fixture(t);
  const plaintext = Buffer.from('remote file');
  const payload = encryptedPart(plaintext);
  const server = createServer((_req, res) => res.end(payload));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const url = `http://127.0.0.1:${server.address().port}/file`;
  const output = join(dir, 'out.bin');
  const command = `& ([scriptblock]::Create((Get-Content -Raw '${join(scripts, 'decrypt-file.ps1')}'))) '${url}' '${seed}' '${output}'`;
  const result = await new Promise((resolve, reject) => {
    const child = spawn(pwsh, ['-NoProfile', '-Command', command]);
    const stderr = [];
    child.stderr.on('data', x => stderr.push(x));
    child.on('error', reject);
    child.on('close', code => resolve({ code, stderr: Buffer.concat(stderr).toString() }));
  });
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(await readFile(output), plaintext);
});

test('file refuses overwrite and preserves existing output', async t => {
  const dir = await fixture(t);
  const source = join(dir, 'file.enc');
  const output = join(dir, 'out.bin');
  await writeFile(source, encryptedPart(Buffer.from('replacement')));
  await writeFile(output, 'keep');
  const result = await run('decrypt-file.ps1', [source, seed, output], 'n\n');
  assert.notEqual(result.code, 0);
  assert.equal((await readFile(output)).toString(), 'keep');
});

test('file replaces existing output after explicit approval', async t => {
  const dir = await fixture(t);
  const source = join(dir, 'file.enc');
  const output = join(dir, 'out.bin');
  await writeFile(source, encryptedPart(Buffer.from('replacement')));
  await writeFile(output, 'old');
  const result = await run('decrypt-file.ps1', [source, seed, output], 'y\n');
  assert.equal(result.code, 0, result.stderr);
  assert.equal((await readFile(output)).toString(), 'replacement');
});

test('file rejects wrong seed and corrupted later part without publishing output', async t => {
  const dir = await fixture(t);
  const source = join(dir, 'file.enc');
  const output = join(dir, 'out.bin');
  await writeFile(source, Buffer.concat([encryptedPart(randomBytes(partPlainSize)), encryptedPart(Buffer.from('end'), true)]));
  const mismatch = await run('decrypt-file.ps1', [source, seed, output]);
  assert.notEqual(mismatch.code, 0);
  assert.match(mismatch.stderr, /checksum mismatch/i);
  await assert.rejects(readFile(output), { code: 'ENOENT' });
  assert.equal((await readdir(dir)).filter(name => name.includes('.partial.')).length, 0);
  const wrong = await run('decrypt-file.ps1', [source, randomBytes(32).toString('base64'), output]);
  assert.notEqual(wrong.code, 0);
  await assert.rejects(readFile(output), { code: 'ENOENT' });
});

test('missing positional args print usage', async () => {
  for (const file of ['decrypt-note.ps1', 'decrypt-file.ps1']) {
    const result = await run(file, []);
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /usage/i);
  }
});
