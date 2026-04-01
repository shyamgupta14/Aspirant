require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./models/Subject');

const compilerDesign = {
    name: "Compiler Design",
    chapters: [
        {
            name: "CH 01: Introduction to Compiler",
            topics: [
                { id: 101, name: "Phases of Compiler", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" }
            ]
        },
        {
            name: "CH 02: Lexical Analysis",
            topics: [
                { id: 201, name: "Basics of Lexical Analysis", vid: "https://www.youtube.com/embed/G5C9KKSS9zs", notes: "#", pyq: "#" },
                { id: 202, name: "Finding the Tokens", vid: "https://www.youtube.com/embed/G5C9KKSS9zs", notes: "#", pyq: "#" }
            ]
        },
        {
            name: "CH 03: Syntax Analysis",
            topics: [
                { id: 301, name: "Context Free Grammar", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" },
                { id: 302, name: "Top Down Parser", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" },
                { id: 303, name: "LR Parser", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" },
                { id: 304, name: "Operator Precedence Parsing", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" }
            ]
        },
        {
            name: "CH 04: Syntax Directed Translation",
            topics: [
                { id: 401, name: "Basics of Syntax Directed Translation", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" },
                { id: 402, name: "Evaluation of Syntax Directed Translation", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" }
            ]
        },
        {
            name: "CH 05: Intermediate Code Generation",
            topics: [
                { id: 501, name: "Basics of ICG", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" },
                { id: 502, name: "Three Address Code", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" }
            ]
        },
        {
            name: "CH 06: Code Optimization",
            topics: [
                { id: 601, name: "Basics of Code Optimization", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" },
                { id: 602, name: "Data Flow Analysis", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" }
            ]
        },
        {
            name: "CH 07: Runtime Environment",
            topics: [
                { id: 701, name: "Basics of Runtime Environment", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" },
                { id: 702, name: "Static and Dynamic Scoping", vid: "https://www.youtube.com/embed/Qkwj65l_96I", notes: "#", pyq: "#" }
            ]
        }
    ]
};

async function seedCompilerDesign() {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb+srv://shyamgupta9009_db_user:Shyam%40900@cluster0.hj7nguq.mongodb.net/aspirant?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');

        // Check if already exists
        const exists = await Subject.findOne({ name: "Compiler Design" });
        if (exists) {
            await Subject.deleteOne({ name: "Compiler Design" });
            console.log('Old Compiler Design removed');
        }

        await Subject.create(compilerDesign);
        console.log('✅ Compiler Design subject added successfully with 7 chapters!');
        
        const all = await Subject.find({}, 'name');
        console.log('All subjects in DB:', all.map(s => s.name));
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

seedCompilerDesign();
