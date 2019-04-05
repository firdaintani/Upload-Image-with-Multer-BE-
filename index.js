var express = require('express')

var bodyParser = require('body-parser')
var app = express()
var mysql = require('mysql')
var cors = require('cors')
var multer = require('multer')
var fs = require('fs');

var app = express()
var port = 4000

const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'1234',
    database:'upload_image'
    // host:'www.db4free.net',
    // user:'firdaintani',
    // password:'12345678',
    // database:'latihantodo'
})
const storageConfig = multer.diskStorage({
    // menentukan tempat menyimpan file
    destination : (req,file,cb)=>{
        cb (null, './uploads')
    } ,
    // nama file
    filename : (req,file,cb)=>{
        cb(null, 'PRD-'+Date.now()+ '.' + file.mimetype.split('/')[1])
    }
})

const filterConfig = (req,file,cb)=>{
    if(file.mimetype.split('/')[1]==='png' || file.mimetype.split('/')[1]==='jpeg'){
        cb(null,true)

    } else{
        req.validation = {error:true, msg : 'File must be image'}
        cb(null,false)
        // cb(new Error('image must be jpg or png'),false)
    }
}


// var upload = multer({storage : storageConfig, fileFilter : filterConfig, limits: {fileSize: 5 * 1024 * 1024}})
var upload = multer({storage : storageConfig, fileFilter : filterConfig})

//agar folder uploads public
app.use('/uploads',express.static('uploads'))
app.use(bodyParser.json())
app.use(cors())
app.get('/', (req,res)=>{
    res.send('<h1>Welcome to API for Upload Image</h1>')
})

app.post('/image',upload.single('image'), (req,res)=>{
   try{
    if(req.validation) throw req.validation
    if(req.file.size > 5*1024) throw {error:TransitionEvent, msg: 'image too large'}
    var data = {...JSON.parse(req.body.data), product_image : req.file.path}
    var sql = 'insert into manage_product set ? '
    db.query(sql, data, (err1,result1)=>{
        try {
           
            // if (err) throw err
            var sql2 = 'select * from manage_product'
            db.query(sql2, (err2,result2)=>{
                try{
                    if(err2) throw err
                    res.send(result2)
                }
                catch(err2){
                    res.send(err2.message)
                }
            })
        }
        catch(err1){
            res.send(err1.message)
        }
    })

}
   catch(err){
        res.send(err)
   }
    // res.send('sukses')
})

app.delete('/delete/:id', (req,res)=>{
    var id = req.params.id
    var path = req.body.product_image
    
    // sql= `select product_image from manage_product where id=${id}`
    // db.query(sql, (err, result)=>{
    // try{
    //     if(err) throw err
        
        sql1=`delete from manage_product where id=${id}`
        db.query(sql1, (err1,result1)=>{
            try{
                if(err1) throw err1
                // var path=result[0].product_image
                fs.unlinkSync(path) 
                
                sql2 =' select * from manage_product'
                db.query(sql2, (err2, result2)=>{
                    try{
                        if(err2) throw err2
                        res.send(result2)
                    }
                    catch(err2){
                        res.send(err2.message)
                    }
                })
            }
            catch(err1){
                res.send(err1.message)
            }
        })
    // }
    // catch{
    //     res.send(err.message)
    // }
    // })
})

app.put('/editProduct/:id',upload.single('editimage'), (req,res)=>{
    var id = req.params.id
    // var old_path = req.body.old_path

    if(req.file){
      
        var data = {...JSON.parse(req.body.data), product_image : req.file.path}
              
        var sql = `update manage_product set ? where id=${id}`
        db.query(sql, data, (err, result)=>{
        try{
            if(err) throw err
            fs.unlinkSync(req.body.imageBefore)
            // console.log(req.body.imageBefore)
            sql2 =' select * from manage_product'
                db.query(sql2, (err2, result2)=>{
                    try{
                        if(err2) throw err2
                        res.send(result2)
                    }
                    catch(err2){
                        res.send(err2.message)
                    }
                })
        }
        catch(err){
            res.send(err.message)
        }
    })
    }else{
        var sql = `update manage_product set ? where id=${id}`
        db.query(sql, req.body, (err, result)=>{
        try{
            if(err) throw err
            sql2 =' select * from manage_product'
                db.query(sql2, (err2, result2)=>{
                    try{
                        if(err2) throw err2
                        res.send(result2)
                    }
                    catch(err2){
                        res.send(err2.message)
                    }
                })
        }
        catch(err){
            res.send(err.message)
        }
    })
    }
   
   
   
   
    // var id = req.params.id
    // // var data = req.body
    // var old_path = req.body.old_path
    // fs.unlinkSync(old_path)
    // var data = req.body
    // var sql = `update manage_product set ? where id=${id}`
    
    // db.query(sql,data,)
} )

// app.put('/editProduct/:id', (req,res)=>{
//     var id = req.params.id
//     var sql = `update manage_product set ? where id=${id}`
//     db.query(sql, req.body, (err, result)=>{

//     })
// })

app.get('/delete/:id', (req,res)=>{
    var id = req.params.id
    sql= `select product_image from manage_product where id=${id}`
    db.query(sql, (err, result)=>{
        res.send(result[0].product_image)
        
    })
})

app.get('/all', (req,res)=>{
    var sql2 = 'select * from manage_product'
            db.query(sql2, (err2,result2)=>{
                try{
                    if(err2) throw err
                    res.send(result2)
                }
                catch(err2){
                    res.send(err2.message)
                }
            })
})

app.post('/images',upload.array('fotoarray', 3), (req,res)=>{
    console.log(req.files)
    res.send('sukses upload banyak')
})

app.listen(port, ()=>console.log('berjalan di port '+port))