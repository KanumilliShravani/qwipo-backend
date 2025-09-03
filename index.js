const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express()
app.use(cors());
app.use(express.json())

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// GET all customers
app.get('/api/customers', (req, res) => {
    const {search_q = ''} = req.query
    const sql = `SELECT * FROM customers
    WHERE first_name LIKE '%${search_q}%'`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});


// POST new customers 
app.post('/api/customers',(req,res) => {
 const { firstName, lastName, phoneNumber } = req.body;

    const sql = `
        INSERT INTO customers (first_name, last_name, phone_number)
        VALUES (?, ?, ?);
    `;

    db.run(sql, [firstName, lastName, phoneNumber], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: "Customer added successfully",
            id: this.lastID
        });
    })
    })

//GET single Customer 
app.get('/api/customers/:id',(req,res) => {
const {id} = req.params
const sql = `
SELECT * FROM customers 
WHERE id = ${id};
`;
db.get(sql,[],(err,data) =>{
      if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": data
        });
})
})

//Update Customers data 
app.put('/api/customers/:id',(req,res) => {
    const {id} = req.params
  const {firstName,lastName,phoneNumber} = req.body
    const sql = `
    UPDATE customers 
    SET first_name = '${firstName}',
    last_name = '${lastName}',
    phone_number = '${phoneNumber}'
    WHERE  id = ${id};
    `;
    db.run(sql)
    res.send("Customer Details Updated")

})

//Delete a Customer 
app.delete('/api/customers/:id',(req,res) => {
const {id} = req.params
const sql = `DELETE FROM customers WHERE id = ?`;

    db.run(sql, [id], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes ===0){
            res.status(400).json({message: "Customer Not found"})
        }else{
            res.json({Message: "Customer Deleted Successfully",deletdId:id})
        }
    });
})

//Post addresss of a  specific customer

app.post('/api/customers/:id/addresses',(req,res) => {
    const {id} = req.params
    const {customerId,addressDetails,city,state,pinCode} = req.body
    const sql = `
    INSERT INTO addresses(customer_id,address_details,city,state,pin_code)
    VALUES(?,?,?,?,?);
    WHERE customer_id = ?;
    `;
    db.run(sql,[customerId,addressDetails,city,state,pinCode],function(err){
     if(err){
        res.status(400).json({error: err.message})
        return;
     }
     if (this.changes === 0){
            return res.status(400).json({message:"Customer Not found"})
        }
        res.json({message:"Address Details Updated",id})
  })
})

// get all  addresses of a customer
app.get('/api/customers/:id/addresses',(req,res) =>{
 const {id} = req.params
 const sql = `
SELECT address_details AS addressDetails,addresses.state,addresses.city,addresses.pin_code AS pinCode
FROM addresses INNER JOIN customers ON addresses.customer_id = customers.id 
WHERE addresses.customer_id = ?;
`;
db.all(sql,[id],(err,data) =>{
      if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": data
        });
})
})

//update a specific address 
app.put('/api/addresses/:id',(req,res) =>{
   const {id} = req.params
   const {addressDetails,city,state,pinCode} = req.body 
   const sql = `
   UPDATE addresses 
   SET address_details = '${addressDetails}',
   city = '${city}',
   state = '${state}',
   pin_code = '${pinCode}'
   WHERE id = ${id};
   `;
   db.run(sql)
   res.send("Address Details Updated")

})

//Delete a specific address 
app.delete('/api/addresses/:id',(req,res) =>{
  const {id} = req.params 
   const sql = `
   DELETE FROM addresses WHERE id = ?;`
   db.run(sql,[id],function(err){
    if(err){
        res.status(400).json({error: err.message})
        return;
    }
    if (this.changes ===0){
        res.status(400).json({message: "Address not found"})
    }else{
        res.json({message: "Address Deleted Successfully"})
    }
   })
})

module.exports = app
