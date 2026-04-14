    const mongoose = require('mongoose');
    const dotenv = require('dotenv');

    // 1. Load the environment variables FIRST
    const path = require('path');
        dotenv.config({ path: path.join(__dirname, '.env') });
    // 2. Import the model AFTER loading the env
    const Novel = require('./models/novel');

    const seedNovel = async () => {
        // Debugging line: Let's see if the URI is actually being found
        console.log("Checking URI:", process.env.MONGO_URI); 

        try {
            if (!process.env.MONGO_URI) {
                throw new Error("MONGO_URI is missing from your .env file!");
            }

            await mongoose.connect(process.env.MONGO_URI);
            console.log("Connected to MongoDB...");
            
            // ... rest of your code ...

            // 3. Your First Georgian Novel entry
            const firstNovel = new Novel({
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                description: "დიდი გეტსბი — ამერიკელი მწერლის ფრენსის სკოტ ფიცჯერალდის 1925 წლის რომანი.",
                coverImage: "https://via.placeholder.com/150",
                genre: ["Classic", "Drama"]
            });

            await firstNovel.save();
            console.log("✅ First novel added successfully!");

            // 4. Close connection
            mongoose.connection.close();
        } catch (err) {
            console.error("❌ Error seeding data:", err);
        }
    };

    seedNovel();