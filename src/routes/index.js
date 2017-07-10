import express from 'express';
import mid from '../middleware'

const router = express.Router();

router.get('/', (req, res, next) => {
    res.json({ 
        response: 'display all question',

     });
});

router.post('/', (req, res, next) => {
    res.json({ 
        response: 'add question and display all',
        body: req.body
     })
})

router.get('/:qID', (req, res, next) => {
    res.json({ 
        response: 'display question and answer relative to the ID: ' + req.params.qID
     })
})

router.post('/:qID/answer', (req, res, next) => {
    res.json({
         response: 'add answer',
         questionId: req.params.id,
         body: req.body
         })
})

router.put('/:qID/answer/:aID', (req, res, next) => {
    res.json({
        response: 'modify answer',
        questionId: req.params.qID,
        answerId: req.params.aID,
        body: req.body
    })
});

router.delete('/:qID/answer/:aID', (req, res, next) => {
    res.json({
        response: 'delete answer',
        questionId: req.params.qID,
        answerId: req.params.aID
    })
})

router.post('/:qID/answer/:aID/:vote', (req, res, next) => {
        if (req.params.vote.search(/^(up|down)$/) === -1 ) {
            const err = new Error("url error");
            err.status = 404;
            next(err);
        } else {
            next();
        }
    }, (req, res, next) => {
    res.json({
        response: req.params.vote + ' answer',
        questionId: req.params.qID,
        answerId: req.params.aID,
        vote: req.params.vote
    })
})

module.exports = router;