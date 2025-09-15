import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('🔗 Attempting to connect to database...')
        console.log('🔗 MONGODB_URL:', process.env.MONGODB_URL ? 'SET' : 'NOT SET')
        
        mongoose.connection.on('connected', ()=> {
            console.log('✅ Database connected successfully')
            console.log('✅ Connected to:', mongoose.connection.host)
            console.log('✅ Database name:', mongoose.connection.name)
        })
        
        mongoose.connection.on('error', (err) => {
            console.error('❌ Database connection error:', err.message)
        })
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ Database disconnected')
        })
        
        // Handle database name properly
        const mongoUrl = process.env.MONGODB_URL
        const dbName = 'pingup'
        
        // If URL already has a database name, replace it; otherwise append it
        let connectionString
        if (mongoUrl.includes('/') && mongoUrl.split('/').length > 3) {
            // URL already has a database name, replace it
            const baseUrl = mongoUrl.substring(0, mongoUrl.lastIndexOf('/'))
            connectionString = `${baseUrl}/${dbName}`
        } else {
            // URL doesn't have a database name, append it
            connectionString = `${mongoUrl}/${dbName}`
        }
        
        console.log('🔗 Connection string:', connectionString.replace(/\/\/.*@/, '//***:***@')) // Hide credentials in logs
        await mongoose.connect(connectionString)
        console.log('🔗 Database connection attempt completed')
    } catch (error) {
        console.error('❌ Database connection failed:', error.message)
        console.error('❌ Full error:', error)
    }
}

export default connectDB