import { createServer } from 'node:http'
import {
  GRAPHQL_ENDPOINT_PATH,
  GRAPHQL_PORT,
  createMindMeshYoga,
} from './createApp'

const port = Number(process.env.PORT) || GRAPHQL_PORT
const yoga = createMindMeshYoga()
const server = createServer(yoga)

server.listen(port, () => {
  const base = `http://localhost:${port}`
  console.info(`MindMesh GraphQL API listening on ${base}${GRAPHQL_ENDPOINT_PATH}`)
  console.info(`GraphiQL available at ${base}${GRAPHQL_ENDPOINT_PATH}`)
})
