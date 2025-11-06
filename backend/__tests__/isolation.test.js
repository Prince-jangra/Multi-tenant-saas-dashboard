import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import app from '../src/server.js'
import Tenant from '../src/models/Tenant.js'
import Resource from '../src/models/Resource.js'

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri)

  const [acme, globex] = await Tenant.insertMany([
    { name: 'Acme', slug: 'acme', theme: { primary: '#e11d48' } },
    { name: 'Globex', slug: 'globex', theme: { primary: '#0ea5e9' } },
  ])

  await Resource.insertMany([
    { tenantId: acme._id, title: 'Acme Doc', content: 'A' },
    { tenantId: acme._id, title: 'Acme Plan', content: 'B' },
    { tenantId: globex._id, title: 'Globex Doc', content: 'G' },
  ])
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

test('tenant acme sees only acme resources', async () => {
  const res = await request(app)
    .get('/api/resources')
    .set('X-Tenant-ID', 'acme')
    .expect(200)
  expect(res.body.map(r => r.title)).toEqual(['Acme Plan', 'Acme Doc'])
})

test('tenant globex sees only globex resources', async () => {
  const res = await request(app)
    .get('/api/resources')
    .set('X-Tenant-ID', 'globex')
    .expect(200)
  expect(res.body.map(r => r.title)).toEqual(['Globex Doc'])
})

test('resources cannot be fetched without tenant', async () => {
  const res = await request(app)
    .get('/api/resources')
    .expect(400)
  expect(res.body.error).toBeDefined()
})

