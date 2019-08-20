// created by : Bhavay Tyagi
var express = require('express');
var app=express();
var server=require('http').Server(app);
var client=require('socket.io')(server).sockets;
var path=require('path');
var ip=require('ip');
var port=3000;

var mongo =require('mongodb').MongoClient;
 mongo.connect('mongodb://localhost:27018/chatdb',function(err,db){
  if(err){
    console.log("error");
  }
  console.log('mongo connected');
  //connect to socket
  client.on('connection',function(socket){
      console.log('a new user is connected');
      let chat = db.collection('chats');
      sendStatus=function(s){
          socket.emit('status',s)
      }
      chat.find().limit(100).sort({_id:1}).toArray(function(err,res){
           if(err){
               console.log("error");
           }
           socket.emit('output',res);
      })
    
      socket.on('input',function(data){
          let name=data.name;
          let message=data.message;
          if(name==''|| message==''){
              sendStatus('please enter name and message')

          }
          else{
              chat.insert({name:name,message:message},function(){
                  client.emit('output',[data]);
                  sendStatus({
                      message:'message sent',
                      clear:true
                  })
              })
          }
      });
    
      socket.on('clear',function(data){
          chat.remove({},function(){
              socket.emit('cleared')
          })
      })

      socket.on('disconnect',function(){
          console.log('a user is disconnected')
      })
  })
})

app.get('/',function(req,res){
    res.sendfile('index.html')
})
server.listen(port,function(){
    console.log('server is listening at '+port);
})
