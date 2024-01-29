const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')


let persons = [
  {
    name: "Arto Hellas",
    phone: "040-123543",
    street: "Tapiolankatu 5 A",
    city: "Espoo",
    id: "3d594650-3436-11e9-bc57-8b80ba54c431"
  },
  {
    name: "Matti Luukkainen",
    phone: "040-432342",
    street: "Malminkaari 10 A",
    city: "Helsinki",
    id: '3d599470-3436-11e9-bc57-8b80ba54c431'
  },
  {
    name: "Venla Ruuska",
    street: "Nallemäentie 22 C",
    city: "Helsinki",
    id: '3d599471-3436-11e9-bc57-8b80ba54c431'
  },
]

const typeDefs = `
  type Address {
    street: String!
    city: String! 
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  enum YesNo {
    YES
    NO
  }
  
  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
  }
  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    edit Number(
        name: String!
        phone: String!
    ): Person
  }
`

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: (root, args) => {
        if (!args.phone) {
          return persons
        }
        const byPhone = (person) =>
          args.phone === 'YES' ? person.phone : !person.phone
        return persons.filter(byPhone)
      },
    findPerson: (root, args) =>
      persons.find(p => p.name === args.name)
  },
  Person: {
    address: ({ street, city }) => {
      return {
        street,
        city,
      }
    },
  }, // define resolvers address field, other fiels using default resolvers
  Mutation: {
    addPerson: (root, args) => {
      const person = { ...args, id: uuid() }
      persons = persons.concat(person)
      return person
    }, // used to add person
    editNumber: (root, args) => {
        const person = persons.find(p => p.name === args.name)
        if (!person) {
          return null
        }
    
        const updatedPerson = { ...person, phone: args.phone }
        persons = persons.map(p => p.name === args.name ? updatedPerson : p)
        return updatedPerson
      }  // update phone based on name
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})


startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})