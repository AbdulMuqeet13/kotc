import CategoriesView from "./CategoriesView";
import CategoriesForm from "./CategoryForm";
import FlaggedQuestionsView from "./FlaggedQuestionsView";
import QuestionsView from "./QuestionsView";
import QuestionForm from "./QuestionForm";
import {getUser} from "@/utils/local";
import QuestionMediaForm from "@/views/questions/QuestionMediaForm";
import QuestionMediaView from "@/views/questions/QuestionMediaView";
import UserContributionsView from "@/views/questions/UserContributionsView";
import UserContributionsForm from "@/views/questions/UserContributionsForm";
import SubCategoriesView from "@/views/questions/SubCategoriesView";
import SubCategoryForm from "@/views/questions/SubCategoryForm";
import QuestionComments from "@/views/questions/QuestionComments";
import CommentsView from "@/views/questions/CommentsView";
import PassageQuestionsView from "@/views/questions/PassageQuestionsView";
import PassageQuestionForm from "@/views/questions/PassageQuestionForm";

const questionsRoutes = [
    getUser()?.scopes.includes('categories:view') ?
        {
            name: 'Categories',
            path: '/categories',
            component: CategoriesView
        } : null,
    (getUser()?.scopes.includes('categories:new') || getUser()?.scopes.includes('categories:edit')) ?
        {
            name: 'Category',
            path: '/category',
            component: CategoriesForm
        } : null,
    getUser()?.scopes.includes('sub-categories:view') ?
        {
            name: 'SubCategories',
            path: '/sub-categories',
            component: SubCategoriesView
        } : null,
    (getUser()?.scopes.includes('sub-categories:new') || getUser()?.scopes.includes('sub-categories:edit')) ?
        {
            name: 'SubCategory',
            path: '/sub-category',
            component: SubCategoryForm
        } : null,
    getUser()?.scopes.includes('questions:view') ?
        {
            name: 'Questions',
            path: '/questions',
            component: QuestionsView
        } : null,
    (getUser()?.scopes.includes('questions:new') || getUser()?.scopes.includes('questions:edit')) ?
        {
            name: 'NewQuestion',
            path: '/question',
            component: QuestionForm
        } : null,
    getUser()?.scopes.includes('passage-questions:view') ?
        {
            name: 'PassageQuestions',
            path: '/passage-questions',
            component: PassageQuestionsView
        } : null,
    (getUser()?.scopes.includes('passage-questions:new') || getUser()?.scopes.includes('passage-questions:edit')) ?
        {
            name: 'NewPassageQuestion',
            path: '/passage-question',
            component: PassageQuestionForm
        } : null,
    getUser()?.scopes.includes('flagged-questions:view') ?
        {
            name: 'FlaggedQuestions',
            path: '/flagged-questions',
            component: FlaggedQuestionsView
        } : null,
    getUser()?.scopes.includes('user-contributions:view') ?
        {
            name: 'UserContributions',
            path: '/user-contributions',
            component: UserContributionsView
        } : null,
    getUser()?.scopes.includes('user-contributions:edit') ?
        {
            name: 'NewUserContribution',
            path: '/user-contribution',
            component: UserContributionsForm
        } : null,
    getUser()?.scopes.includes('question-media:view') ?
        {
            name: 'QuestionMedia',
            path: '/question-medias',
            component: QuestionMediaView
        } : null,
    (getUser()?.scopes.includes('question-media:new') || getUser()?.scopes.includes('question-media:edit')) ?
        {
            name: 'QuestionMedia',
            path: '/question-media',
            component: QuestionMediaForm
        } : null,
    (getUser()?.scopes.includes('comments:view')) ?
        {
            name: 'QuestionComment',
            path: '/question/comment',
            component: QuestionComments
        } : null,
    (getUser()?.scopes.includes('comments:view')) ?
        {
            name: 'Comments',
            path: '/comments',
            component: CommentsView
        } : null
];


export const questionsRouter = questionsRoutes.filter(function (x) {
    return x !== null;
})
