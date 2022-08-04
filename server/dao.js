'use strict';
const moment = require('moment'); 
const sqlite=require('sqlite3');
const misc=require('./misc.js');
const bcrypt = require('bcrypt');
const db=new sqlite.Database('cars.sqlite',(err)=>{
    if(err) throw err;
});

exports.getAllCars=function (){
    return new Promise((resolve,reject)=>{
        const sql='SELECT * FROM cars GROUP BY brand,model,category'; 
        db.all(sql,[],(err,rows)=>{
            if(err){
                reject(err);
                return;
            }
            const cars=rows.map((c)=>({carID: c.carID,brand: c.brand,model: c.model,category: c.category}));
            resolve(cars);
        });
    });
};

exports.checkAvbPrice=function (categ,kmd,eta,guidAdd,ass,dataI,dataF,userID){
    return new Promise((resolve,reject)=>{
        let count=0;
        let countAll=0;
        let nPastRents=0;
        let now=moment();
        const setA=new Set();
        const setNA=new Set();
        let diff=[];

        const sql1='SELECT rentals.rentalID,cars.carID,DataInizio,DataFine FROM rentals INNER JOIN cars ON rentals.carID=cars.carID AND category=?';
        const sql2='SELECT carID FROM cars WHERE category=? AND carID NOT IN (SELECT carID FROM rentals)';
        const sql3='SELECT DataInizio,DataFine FROM rentals WHERE username=?';
        
        db.all(sql3,[userID],(err,rows)=>{
          if(err){
            reject(err);
            return;
          }
          if(rows.length!==0){
            rows.map((r)=>{
              if(moment(r.dataFine).isBefore(now))
                nPastRents++; 
            });
          }
        });

        db.all(sql1,[categ],(err,rows)=>{
            if(err){
                reject(err);
                return;
            }
            if(rows.length!==0){ 
                
                rows.map((r)=>{
                    if(moment(r.dataInizio).isAfter(dataF) || moment(r.dataFine).isBefore(dataI))
                        setA.add(r.carID); 
                    else 
                        setNA.add(r.carID);      
                });
                diff=[...setA].filter(x => !setNA.has(x));
                count+=diff.length; 
                countAll+=setNA.size; 
            }
            db.all(sql2,[categ],(err,rows)=>{
                if(err){
                    reject(err);
                    return;
                }
                //
                if(rows.length!==0){
                diff.push(rows[0].carID);
                count+=rows.length;
                countAll+=count;
                }
                let tmp=[...diff];
                
                if(tmp.length!==0){
                  let cID=tmp[0];
                  const res=[count,misc.calcPrice(categ,kmd,eta,guidAdd,ass,dataI,dataF,nPastRents,count/countAll),cID];
                  resolve(res);
                }else{
                  const res=[count,0,''];
                  resolve(res);
                }
            });
        });
    });
};

exports.checkUserPass = function (user, pass) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT username, passwordhash, name FROM users WHERE username = ?';
    db.all(sql, [user], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      if (rows.length === 0) {
        reject(null);
        return;
      }
      const passwordHashDb = rows[0].passwordhash;
      bcrypt.compare(pass, passwordHashDb, function (err, res) {
        if (err)
          reject(err);
        else {
          if (res) {
            resolve({
              userID: rows[0].username,
              name: rows[0].name,
            });
            return;
            } else {
            reject(null);
            return;
            }
        }
      });
    });
  });
};
  
exports.loadUserInfo = function (userID) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT username, name FROM users WHERE username = ?';
    db.all(sql, [userID], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      if (rows.length === 0) {
        reject(null);
        return;
      }
      resolve({
        userID: rows[0].username,
        name: rows[0].name,
      });
      return;
    });
  });
};

exports.insertRental = function (rental, userID) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO rentals(username,carID,dataInizio,dataFine) VALUES(?, ?, ?, ?)';
    db.run(sql, [userID,rental.carID,rental.dataI,rental.dataF], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(null);
    });
  });
};

exports.getRentals = function (userID) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT rentalID,category,DataInizio,DataFine FROM rentals INNER JOIN cars ON cars.carID=rentals.carID AND rentals.username=?';
    db.all(sql, [userID], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const rentals = rows.map((r) => (
      {
        rentalID: r.rentalID,
        category: r.category,
        dataI: r.dataInizio,
        dataF: r.dataFine,
      }));
      resolve(rentals);
    });
  });
};

exports.deleteRental = function (rentalID, userID) {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM rentals WHERE rentalID = ? AND username = ?';
    db.run(sql, [rentalID, userID], (err) => {
    if (err) {
      reject(err);
      return;
    } else
      resolve(null);
    });
  });
};