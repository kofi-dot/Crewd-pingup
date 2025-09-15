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
        
        await mongoose.connect(`${process.env.MONGODB_URL}/pingup`)
        console.log('🔗 Database connection attempt completed')
    } catch (error) {
        console.error('❌ Database connection failed:', error.message)
        console.error('❌ Full error:', error)
    }
}

export default connectDB