// services/auditLogger.js

import pg from "pg"

const {Pool}=pg

const pool=new Pool({
connectionString:process.env.DATABASE_URL
})

export async function logAction(userId,action){

await pool.query(

`INSERT INTO audit_logs(user_id,action,timestamp)
VALUES($1,$2,NOW())`,

[userId,action]

)

}