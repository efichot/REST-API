import express from 'express';
import mid from '../middleware';

const Question = require('../models/qa').Question;

const router = express.Router();

router.param('qID', function (req, res, next, qid) {
    Question.findById({_id: qid}).exec(function (err, doc) {
        if (err) return next(err);
        if (!doc) {
            err = new Error('Not Found');
            err.status = 404;
            next(err);
        }
        req.question = doc;
        return next();
    })
});

router.param('aID', (req, res, next, id) => {
    //console.log(req.question.id());
    req.answer = req.question.answers.id(id);
    if (!req.answer) {
            const err = new Error('Not Found');
            err.status = 404;
            next(err);
    }
    next();
});

router.get('/', (req, res, next) => {
    Question.find({}).sort({createdAt: -1}).exec((err, questions) => {
        if (err) return next(err);
        res.json(questions);
    });
});

router.post('/', (req, res, next) => {
    const question = new Question(req.body);
    question.save((err, question) => {
        if (err) return next(err);
        res.status(201);
        res.json(question);
    });
});

router.get('/:qID', (req, res, next) => {
    res.json(req.question);
});

router.post('/:qID/answer', (req, res, next) => {
    // console.log(req.question.answer);
    req.question.answers.push(req.body);
    req.question.save((err, doc) => {
        if (err) return next(err);
        res.status(201);
        res.json(doc);
    });
});

router.put('/:qID/answer/:aID', (req, res, next) => {
    req.answer.update(req.body, (err, result) => {
        if (err) return next(err);
        res.json(result);
    })
});

router.delete('/:qID/answer/:aID', (req, res, next) => {
    req.answer.remove((err) => {
        if (err) return next(err);        
        req.question.save((err, result) => {
            if (err) return next(err);
            res.json(result);
        })
    })
})

router.post('/:qID/answer/:aID/:vote', (req, res, next) => {
        if (req.params.vote.search(/^(up|down)$/) === -1 ) {
            const err = new Error("url error");
            err.status = 404;
            next(err);
        } else {
            req.vote = req.params.vote;
            next();
        }
    }, (req, res, next) => {
        req.answer.votes(req.params.vote, (err, result) => {
            if (err) return next(err);
            res.json(result);
        })
})

module.exports = router;