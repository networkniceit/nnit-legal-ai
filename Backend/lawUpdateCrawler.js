// services/lawUpdateCrawler.js

import axios from "axios"
import pg from "pg"

const {Pool}=pg

const pool=new Pool({
connectionString:process.env.DATABASE_URL
})

export async function updateLegalDatabase(){

const response=await axios.get("https://api.examplelawdata.com/laws")

const laws=response.data

const client=await pool.connect()

try{

for(const law of laws){

await client.query(

`INSERT INTO laws(title,content)
VALUES($1,$2)
ON CONFLICT DO NOTHING`,

[law.title,law.text]

)

}

}finally{

client.release()

}

}