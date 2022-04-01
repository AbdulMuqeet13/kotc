import axios from 'axios';

export class QuestionsService {
    async fetchAll() {
        return (await axios.get('/questions')).data;
    }

    async fetchOne(id) {
        return (await axios.get('/questions/' + id)).data;
    }

    async create(question) {
        return (await axios.post('/questions', question)).data;
    }

    async delete(question) {
        return (await axios.delete('/questions/' + question.id)).data;
    }

    async update(question) {
        return (await axios.patch('/questions', question)).data;
    }

    async filter(query) {
        return (await axios.get('/questions/filter?' + query)).data;
    }

    async getPassageQuestions() {
        return (await axios.get('/questions/for-passage')).data;
    }

    async fetchAllComments() {
        return (await axios.get('/question-comments')).data;
    }

    async fetchComments(id) {
        return (await axios.get('/question-comments/all/' + id)).data;
    }

    async deleteComment(comment) {
        return (await axios.delete('/question-comments/' + comment.id)).data;
    }

    async updateComment(comment) {
        return (await axios.patch('/question-comments', comment)).data;
    }
}
