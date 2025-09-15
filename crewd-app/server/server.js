import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import {inngest, functions} from './inngest/index.js'
import {serve} from 'inngest/express'
import { clerkMiddleware } from '@clerk/express'
import userRouter from './routes/userRotes.js';
import postRouter from './routes/postRoutes.js';
import storyRouter from './routes/storyRoutes.js';
import messageRouter from './routes/messageRoutes.js';

const app = express();

app.use(cors({
  origin: "https://crewd-client.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

await connectDB();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get('/', (req, res)=> res.send('Server is running'))

// Test Inngest endpoint
app.get('/api/inngest/test', (req, res) => {
    console.log('🧪 Inngest endpoint test - endpoint is accessible')
    res.json({success: true, message: 'Inngest endpoint is working'})
})

// Database connection test endpoint
app.get('/api/health/db', async (req, res) => {
    try {
        console.log('🔍 Testing database connection...')
        console.log('MONGODB_URL:', process.env.MONGODB_URL ? 'SET' : 'NOT SET')
        console.log('🔍 All environment variables starting with MONGO:', Object.keys(process.env).filter(key => key.startsWith('MONGO')))
        console.log('🔍 Environment:', process.env.NODE_ENV)
        console.log('🔍 Vercel environment:', process.env.VERCEL)
        
        if (!process.env.MONGODB_URL) {
            console.error('❌ MONGODB_URL environment variable is not set')
            return res.status(500).json({
                success: false,
                message: 'MONGODB_URL environment variable is not set',
                database: 'disconnected',
                env: 'missing'
            })
        }

        // Test database connection
        const mongoose = await import('mongoose')
        const connectionState = mongoose.default.connection.readyState
        
        console.log('📊 Database connection state:', connectionState)
        console.log('📊 Connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting')
        
        if (connectionState === 1) {
            console.log('✅ Database is connected')
            
            // Test a simple query
            const User = (await import('./models/User.js')).default
            const userCount = await User.countDocuments()
            console.log('📊 Total users in database:', userCount)
            
            return res.json({
                success: true,
                message: 'Database connection successful',
                database: 'connected',
                userCount: userCount,
                connectionState: connectionState
            })
        } else {
            console.log('❌ Database is not connected. State:', connectionState)
            return res.status(500).json({
                success: false,
                message: 'Database is not connected',
                database: 'disconnected',
                connectionState: connectionState
            })
        }
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message)
        console.error('❌ Full error:', error)
        return res.status(500).json({
            success: false,
            message: 'Database connection test failed',
            error: error.message,
            database: 'error'
        })
    }
})
// Add logging for all requests to /api/inngest
app.use('/api/inngest', (req, res, next) => {
    console.log('🔗 Inngest request received:', req.method, req.url)
    console.log('🔗 Headers:', req.headers)
    if (req.body) {
        console.log('🔗 Body:', JSON.stringify(req.body, null, 2))
    }
    next()
})

app.use('/api/inngest', serve({ client: inngest, functions }))
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/api/story', storyRouter)
app.use('/api/message', messageRouter)

const PORT = process.env.PORT || 4000;


app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`))
