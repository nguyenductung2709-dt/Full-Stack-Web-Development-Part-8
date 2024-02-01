const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const jwt = require('jsonwebtoken')



let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user');
require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = `
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    bookCount: Int!
    id: ID!
    born: Int
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genres: [String]): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    bookCount: async() => Book.collection.countDocuments(), //count length of books

    authorCount: async() => Author.collection.countDocuments(), //count length of authors in database

    allBooks: async (root, args) => {
      let query = {};
    
      if (args.author) {
        query.author = args.author;
      }
    
      if (args.genres) {
        query.genres = { $all: args.genres }; // $all is used to select documents where the specified array field contains all the specified elements
      }
    
      try {
        const books = await Book.find(query).populate('author');
        return books;
      } catch (error) {
        throw new Error(`Error fetching books: ${error.message}`);
      }
    },    

    allAuthors: async() => {
      return Author.find({})
    },
    
    me: (root, args, context) => {
      return context.currentUser
    }
  },

  Author: {
    bookCount: async ({ name }) => {
      const author = await Author.find({ name: name });
      let query = { author }; 
      const books = await Book.find(query);
  
      if (books === null || books === undefined) {
        return 0;
      }
  
      return books.length;
    }
  },
  
  Mutation: {

    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.author });

      if (!context.currentUser) {
        throw new Error('Authentication required to add a book');
      }
  
      // If the author doesn't exist, create a new author
      if (!author) {
        author = new Author({ name: args.author });
        await author.save();
      }
  
      const book = new Book({
        ...args,
        author: author._id, // Use the ObjectId of the author
        genres: args.genres,
      });
  
      try {
      await book.save();
      }
      catch (error) {
        throw new GraphQLError('Saving person failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      
      // Retrieve the book with populated author information
      const savedBook = await Book.findById(book._id).populate('author');
  
      return savedBook; // Return the created book with populated author
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new Error('Authentication required to add a book');
      }
      
      try {
        const updatedAuthor = await Author.findOneAndUpdate(
          { name: args.name },
          { $set: { born: args.setBornTo } },
          { new: true }
        );
        return updatedAuthor;
      } catch (error) {
        throw new Error(`Editing author failed: ${error.message}`);
      }
    },

    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })
      return user.save()
      .catch(error => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error
        }
      })
    })
    },

    login: async(root,args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'tungdt') {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' }
        })    
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      }
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    }
}}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;

    try {
      if (auth && auth.startsWith('Bearer')) {
        const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET);
        const currentUser = await User.findById(decodedToken.id);

        if (currentUser) {
          return { currentUser };
        }
      }
    } catch (error) {
      console.error('Token verification error:', error.message);
    }

    return { currentUser: { username: null, favoriteGenre: null, id: null } };
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
