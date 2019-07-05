'use strict';
let Board = require('../models/Board.js');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .post((req, res)=>{//4 - POST a thread
    let boardName = req.body.board || req.params.board;
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
      if (data != null) {
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
        
        res.json(threads.slice(0, maxArrayPosition));
      }else{
        res.send("This board does not exist.")
      }    
    });
  })
  .delete((req, res)=>{//8 - Delete entire thread
    let boardName = req.params.board;
    let thread_id = req.body.thread_id;
    let delete_password = req.body.delete_password;
    let error = false;
    Board.findOne({name: boardName}, (err, data)=>{
      let newThreads = [];
      data.thread.map((thread)=>{
        if (thread._id != thread_id) {
          newThreads.push(thread);
        }else{
          if (thread.delete_password != delete_password) {
            error = true;
          }
        }
      });
      if(error == true) {
        res.send("Incorrect password.");
      }else{
        Board.findOneAndUpdate({name: boardName}, {thread: newThreads}, {new: true}, (err, data)=>{
          res.send("Success!");
        });
      }      
    });
  })
  .put((req, res)=>{//10 - Report Thread
    let boardName = req.params.board;
    let thread_id = req.body.thread_id;
    let delete_password = req.body.delete_password;
    Board.findOne({name: boardName}, (err, data)=>{
      if (data == null) {
        res.send("This board does not exist!");
      }else{
        let specificThread;
        data.thread.map((thread)=>{
          if (thread._id == thread_id) {
            specificThread =  thread;           
          }
        });
        specificThread.reported = true;
        let newThreads = [];
        data.thread.map((thread)=>{
          if (thread._id == thread_id) {
            newThreads.push(specificThread);
          }else{
            newThreads.push(thread);
          }
        });
        Board.findOneAndUpdate({name: boardName}, {thread: newThreads}, {new: true}, (err, data)=>{
          if (data == null) {
            res.send("Something went wrong!");
          }else{
            res.send("Success!");
          }
        });        
      }
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
    
  })
  .get((req, res)=>{//7 - Get entire thread
    let boardName = req.params.board;
    let thread_id = req.query.thread_id;
    if (thread_id) {
      Board.findOne({name: boardName}, (err, data)=>{
        let entireThread;
        data.thread.map((thread)=>{
          if (thread._id==thread_id) {
            entireThread = thread;
          }
        });
        let replies = [];
        entireThread.replies.map((reply)=>{
          let r = {};
          r.text = reply.text;
          r.created_on = reply.created_on;
          replies.push(r);
        });
        entireThread.replies = replies;
        res.json(entireThread);
      });
    }else{
      res.send("You forgot to provide thread_id!");
    }
  })
  .delete((req, res)=>{//9 - Delete a post
    let boardName = req.params.board;
    let thread_id = req.body.thread_id;
    let reply_id = req.body.reply_id;
    let delete_password = req.body.delete_password;
    Board.findOne({name: boardName}, (err, data)=>{
      let specificThread;
      data.thread.map((thread)=>{
        if (thread._id == thread_id) {
          specificThread = thread;
        }
      });
      let error = false;
      specificThread.replies.map((reply)=>{
        if (reply._id == reply_id) {
          if (reply.delete_password == delete_password) {
            reply.text = "[deleted]";
          }else{
            error = true;
          }
        }
      })
      if (error = true) {
        res.send("Incorrect password");
      }else{
        let newThreads = [];
        data.thread.map((thread)=>{
          if (thread._id == thread_id) {
            newThreads.push(specificThread);
          }else{
            newThreads.push(thread);
          }
        })
        Board.findOneAndUpdate({name: boardName}, {thread: newThreads}, {new: true}, (err, data)=>{
          if (data == null) {
            res.send("Something went wrong.");
          }else{
            res.send("Success!");
          }        
        });
      }      
    });
  })
  .put((req, res)=>{//11 - Report replies
    let boardName = req.params.board;
    let thread_id = req.body.thread_id;
    let reply_id = req.body.reply_id;
    let delete_password = req.body.delete_password;
    let error = false;
    Board.findOne({name: boardName}, (err, data)=>{
      let specificThread;
      data.thread.map((thread)=>{
        if (thread._id == thread_id) {
          specificThread = thread;
        }
      });
      specificThread.replies.map((reply)=>{
        if (reply._id == reply_id){
          reply.reported = true;
        }
      });
      let newThreads = [];
      data.thread.map((thread)=>{
        if (thread._id == thread_id) {
          newThreads.push(specificThread);
        }else{
          newThreads.push(thread);
        }
      });
      Board.findOneAndUpdate({name: boardName}, {thread: newThreads}, {new: true}, (err, data)=>{
        if(data == null) {
          res.send("Something went wrong!");
        }else{
          res.send("Success!");
        }
      });
    });
  });
};
