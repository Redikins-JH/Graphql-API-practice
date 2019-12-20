const { ApolloServer } = require('apollo-server')


const typeDefs = `
  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LACDSCAPE
    GRAPHIC
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
  }

  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }
  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`


//사용자 샘플

var users = [
  {
    githubLogin: 'mHattrup',
    name: 'Mike Hattrup'
  },
  {
    githubLogin: 'gPlake',
    name: 'Glen Plake'
  },
  {
    githubLogin: 'sSchmidt',
    name: 'Scot Schmidt'
  },
]

var photos = [
  {
    id: '1',
    name: 'ropping the Heart Chute',
    description: 'the geart chute is one of my gavorite chutes',
    category: 'ACTION',
    githubUser: 'gPlake',
  },
  {
    id: '2',
    name: 'Enjoying the sunshine',
    category: 'SELFIE',
    githubUser: 'sSchmidt',
  },
  {
    id: '3',
    name: 'Gunbarrel 25',
    description: '25 laps on gunbarrel tody',
    category: 'LANDSCAPE',
    githubUser: 'sSchmidt',
  }
]

var tags = [
  { photoID: '1', userID: 'gPlake'},
  { photoID: '2', userID: 'sSchmidt'},
  { photoID: '2', userID: 'mHattrup'},
  { photoID: '2', userID: 'gPlake'},
]


var _id = 0
//var photos = []

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },

  Mutation: {
    postPhoto (parent, args) {
      var newPhoto = {
        id: _id ++,
        ...args.input
      }
      photos.push(newPhoto)
      return newPhoto
    }
  },

  Photo: {
    url: parent => `http://mysite.com/${parent.id}.jpg`,
    postedBy: parent => {
      return users.find(u => u.githubLogin === parent.githubUser)
    },
    taggedUsers: parent => tags
      .filter(tag => tag.photoID === parent.id)
      .map(tag => tag.userID)
      .map(userID => users.find(u => u.githubLogin === userID))
  },
  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin)
    },
    inPhotos: parent => tags
      .filter(tag => tag.userID === parent.id)
      .map(tag => tag.photoID)
      .map(photoID => photos.find(p => p.id === photoID))
  }

}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server
  .listen()
  .then(({url}) => console.log(`GraphQL Service running on ${url}`))