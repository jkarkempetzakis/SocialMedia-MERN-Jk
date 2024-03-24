import mongoose from "mongoose";

const connectToDB = async () => {

    try {
        const conn = await mongoose.connect(process.env.MONGO_DB_URI, {
            //Avoiding console warnings
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};


export default connectToDB;