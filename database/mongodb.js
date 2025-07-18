import mongoose from 'mongoose'
import {DB_URL,NODE_ENV} from "../config/env.js";

if(!DB_URL){
    throw new Error("MongoDB URL is missing");
}

const connectToDatabase = async () => {
    try{
        await mongoose.connect(DB_URL);
        console.log(`MongoDB Connected To Database running in ${NODE_ENV}`);
    }
    catch(err){
        console.error(err);
        process.exit(1);
    }
}
export default connectToDatabase;