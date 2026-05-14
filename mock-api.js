import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'

const PORT = 3001
const DB_FILE = new URL('./db.json', import.meta.url)
const collections = new Set(['admins', 'customers', 'products', 'food-producst'])

async function readDb() {
  return JSON.parse(await readFile(DB_FILE, 'utf8'))
}

async function writeDb(data) {
  await writeFile(DB_FILE, JSON.stringify(data, null, 2))
}

function send(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  })
  response.end(JSON.stringify(data))
}

function getBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
    })

    request.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
  })
}

function filterByQuery(records, searchParams) {
  return records.filter((record) =>
    [...searchParams.entries()].every(([key, value]) => String(record[key]) === value),
  )
}

function nextId(records) {
  const highestId = records.reduce((highest, record) => {
    const id = Number(record.id)
    return Number.isNaN(id) ? highest : Math.max(highest, id)
  }, 0)

  return String(highestId + 1)
}

createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    send(response, 204, {})
    return
  }

  try {
    const url = new URL(request.url, `http://localhost:${PORT}`)
    const [, collectionName, id] = url.pathname.split('/')

    if (!collections.has(collectionName)) {
      send(response, 404, { message: 'Endpoint not found' })
      return
    }

    const db = await readDb()
    const records = db[collectionName] ?? []

    if (request.method === 'GET') {
      if (id) {
        const record = records.find((item) => item.id === id)
        send(response, record ? 200 : 404, record ?? { message: 'Record not found' })
        return
      }

      send(response, 200, filterByQuery(records, url.searchParams))
      return
    }

    if (request.method === 'POST') {
      const body = await getBody(request)
      const record = { ...body, id: nextId(records) }
      db[collectionName] = [...records, record]
      await writeDb(db)
      send(response, 201, record)
      return
    }

    if (request.method === 'PUT' || request.method === 'PATCH') {
      const body = await getBody(request)
      const recordIndex = records.findIndex((item) => item.id === id)

      if (recordIndex === -1) {
        send(response, 404, { message: 'Record not found' })
        return
      }

      const updatedRecord =
        request.method === 'PATCH' ? { ...records[recordIndex], ...body, id } : { ...body, id }
      db[collectionName] = records.map((item) => (item.id === id ? updatedRecord : item))
      await writeDb(db)
      send(response, 200, updatedRecord)
      return
    }

    if (request.method === 'DELETE') {
      db[collectionName] = records.filter((item) => item.id !== id)
      await writeDb(db)
      send(response, 200, {})
      return
    }

    send(response, 405, { message: 'Method not allowed' })
  } catch (error) {
    send(response, 500, { message: 'Mock API error' })
  }
}).listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`)
})
