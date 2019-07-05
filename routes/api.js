'use strict';
let Board = require('../models/Board.js');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .post((req, res)=>{//4 - POST a thread
    let boardName = req.body.board;
    Board.findOne({name: boardName}, (err, data) =>{
      if(data==null){
        let b = new Board({name: boardName,
                           thread: [{
                             text: req.body.text,
                             created_on: new Date(),
                             bumped_on: new Date(),
                             delete_password: req.body.delete_password
                           }]
                          });
        b.save();
        res.json(b);
      }else{
        let threads = data.thread;
        let newThread = {
          text: req.body.text,
          created_on: new Date(),
          bumped_on: new Date(),
          reported: false,
          delete_password: req.body.delete_password,
          replies: []          
        };
        threads.push(newThread);        
        Board.findOneAndUpdate({name: boardName}, {thread: threads}, {new: true}, (err, data)=>{
          res.json(data);
        });
      }
    });    
  })
  .get((req, res)=>{//6 - Get 10 most recent threads
    let boardName = req.params.board;
    Board.findOne({name: boardName}, (err, data)=>{
      let threads = [];
      
      data.thread.map((thread)=>{
        let t = {};
        t._id = thread._id;
        t.text = thread.text;
        t.created_on = thread.cretead_on;
        t.bumped_on = thread.bumped_on;
        let topReplies = [];
        
        thread.replies.sort(function(a,b){
          return new Date(b.bumped_on) - new Date(a.bumped_on);
        });;
        
        for(let i = 0; i<thread.replies.length; i++) {
          topReplies.push(thread.replies[i]);
          if (i >= 3) break;
        }
        t.replies = topReplies;
        threads.push(t);
      });
      
      threads.sort(function(a,b){
        return new Date(b.bumped_on) - new Date(a.bumped_on);
      });;
      
      let maxArrayPosition = (threads.length > 10 ? 10 : threads.length);
      //Must return 10 threads with 3 latest replies, and no reported nor delete_password
      res.json(threads.slice(0, maxArrayPosition));
    });
  });
    
  app.route('/api/replies/:board')
  .post((req, res)=>{//5 - POST a reply
    let boardName = req.params.board;
    let thread_id = req.body.thread_id;
    let text = req.body.text;
    let delete_password = req.body.delete_password;
    Board.findOne({name: boardName}, (err, data)=>{
      if(data==null) {
        res.send("This board does not exist!");
      }else{
        let boardData = data;
        let position;
        for (let i = 0; i < boardData.thread.length; i++) {
          if (boardData.thread[i]._id == thread_id) {
            position = i;
          }
        }
        let specificThread = boardData.thread[position];
        
        specificThread.replies.push({
          text: text, 
          created_on: new Date(),
          delete_password: delete_password,
          reported: false          
        });        
        
        boardData.thread.map((thread)=>{
          if (thread._id == thread_id) {
            thread = specificThread;
            thread.bumped_on = new Date();
          }          
        });
        Board.findOneAndUpdate({name: boardName}, {thread: boardData.thread}, {new: true}, (err, data)=>{
          if (data==null || err) {
            res.send("Something went wrong!");
          }else{
            res.redirect("/b/"+ boardName + "/" + thread_id);
          }          
        });
      }
    });    
    
  });

};
