import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const sortAnswers = (a, b) => {
    if (a.votes === b.votes) {
        return (b.updateAt - a.updateAt);
    }
    return (b.votes - a.votes);
}

const answerSchema = new Schema({
    text: String,
    createdAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
    vote: { type: Number, default: 0 }
})

answerSchema.method('update', (updates, callback) => {
    Object.assign(this, updates, { updateAt: new Date() });
    this.parent().save(callback);
});

answerSchema.method('votes', (votes, callback) => {
    if (votes === 'up') {
        this.vote++;
    } else {
        this.vote--;
    }
    this.parent().save(callback);
});

const QuestionSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    answers: [answerSchema]
})

QuestionSchema.pre('save', function (next) {
    this.answers.sort(sortAnswers);
    next();
});

const Question = mongoose.model('Question', QuestionSchema);

module.exports.Question = Question;