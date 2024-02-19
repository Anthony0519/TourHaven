const express = require("express")
require("./config/dbConfig")
const cors = require("cors")
const userRouter = require("./routers/userRouter")

const PORT = process.env.port

const app = express()
app.use(express.json())
app.use(cors({origin: "*"}))
app.use("/api/v1/users",userRouter)

app.listen(PORT,()=>{
    console.log(`SERVER ON PORT: ${PORT}`);
})
