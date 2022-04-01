import {getUser} from "@/utils/local";
import DecksView from "@/views/flashcards/DecksView";
import FlashcardsView from "@/views/flashcards/FlashcardsView";
import DeckForm from "@/views/flashcards/DeckForm";
import FlashcardForm from "@/views/flashcards/FlashcardForm";

const flashcardsRoutes = [
    getUser()?.scopes.includes('decks:view') ?
        {
            name: 'Decks',
            path: '/decks',
            component: DecksView
        } : null,
    (getUser()?.scopes.includes('decks:new') || getUser()?.scopes.includes('decks:edit')) ?
        {
            name: 'NewDeck',
            path: '/deck',
            component: DeckForm
        } : null,
    getUser()?.scopes.includes('flashcards:view') ?
        {
            name: 'Flashcards',
            path: '/flashcards',
            component: FlashcardsView
        } : null,
    (getUser()?.scopes.includes('flashcards:new') || getUser()?.scopes.includes('flashcards:edit')) ?
        {
            name: 'NewFlashcard',
            path: '/flashcard',
            component: FlashcardForm
        } : null
];

export const flashcardsRouter = flashcardsRoutes.filter(function(x) {
    return x !== null;
})
