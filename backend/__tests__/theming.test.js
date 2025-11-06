import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import app from '../src/server.js'
import Tenant from '../src/models/Tenant.js'

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri)
  await Tenant.insertMany([
    { name: 'Acme', slug: 'acme', theme: { primary: '#ff0000', background: '#101010', text: '#fafafa' } },
  ])
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

test('current.css returns CSS variables for tenant', async () => {
  const res = await request(app)
    .get('/api/themes/current.css')
    .set('X-Tenant-ID', 'acme')
    .expect(200)
  expect(res.text).toContain(':root')
  expect(res.text).toContain('--color-primary:#ff0000')
  expect(res.headers['content-type']).toMatch(/text\/css/)
})

