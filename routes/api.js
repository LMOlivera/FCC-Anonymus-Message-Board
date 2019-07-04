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
                             bumped_on: new Date()
                           }]
                          });
        b.save();
      }else{
        /*let replies = data.thread.replies;
        replies.push(req.body.text);
        Board.findOneAndUpdate({name: boardName}, {replies: replies}, {new: true}, (err, data)=>{
          
        });*/
        res.message("This board already exists!");
      }
    });    
  });
    
  app.route('/api/replies/:board');

};
