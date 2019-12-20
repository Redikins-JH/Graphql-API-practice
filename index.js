const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs')
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')
const resolvers = require('./resolvers')
const { MongoClient } = require('mongodb')
require('dotenv').config()




async function start() {
  const app = express()
  const MONGO_DB = process.env.DB_HOST

  const client = await MongoClient.connect(
    MONGO_DB,
    { useNewUrlParser: true },
    console.log('DB connected')
  )
  const db = client.db()

  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const githubToken = req.headers.authorization
      const currentUser = await db.collection('user').findOne({ githubToken })
      return { db, currentUser }
    }
  })
    
  server.applyMiddleware({app})

  app.get('/', (req, res) => res.end('Welcome to PhotoShare API'))
  app.get('/playground', expressPlayground({ endpoint: '/graphql'}))

  app.listen({port:4000}, () => {
    console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
  })
}

start()


// //사용자 샘플

// var users = [
//   {
//     githubLogin: 'mHattrup',
//     name: 'Mike Hattrup'
//   },
//   {
//     githubLogin: 'gPlake',
//     name: 'Glen Plake'
//   },
//   {
//     githubLogin: 'sSchmidt',
//     name: 'Scot Schmidt'
//   },
// ]

// var photos = [
//   {
//     id: '1',
//     name: 'ropping the Heart Chute',
//     description: 'the geart chute is one of my gavorite chutes',
//     category: 'ACTION',
//     githubUser: 'gPlake',
//     created: "3-28-1977"
//   },
//   {
//     id: '2',
//     name: 'Enjoying the sunshine',
//     category: 'SELFIE',
//     githubUser: 'sSchmidt',
//     created: "1-2-1985"
//   },
//   {
//     id: '3',
//     name: 'Gunbarrel 25',
//     description: '25 laps on gunbarrel tody',
//     category: 'LANDSCAPE',
//     githubUser: 'sSchmidt',
//     created: "2018-04-15T19:09:57.308Z"
//   },
  
// ]

// var tags = [
//   { photoID: '1', userID: 'gPlake'},
//   { photoID: '2', userID: 'sSchmidt'},
//   { photoID: '2', userID: 'mHattrup'},
//   { photoID: '2', userID: 'gPlake'},
// ]

// var _id = 0


