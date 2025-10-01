--- START OF FILE script.js ---

document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    const BIBLE_BOOKS = {
        "Old Testament": { "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34, "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36, "Ezra": 10, "Nehemiah": 13, "Tobit": 14, "Judith": 16, "Esther": 16, "1 Maccabees": 16, "2 Maccabees": 15, "Job": 42, "Psalms": 150, "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Wisdom": 19, "Sirach": 51, "Isaiah": 66, "Jeremiah": 52, "Lamentations": 5, "Baruch": 6, "Ezekiel": 48, "Daniel": 14, "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4 },
        "New Testament": { "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22 }
    };
    const DEUTEROCANONICAL_BOOKS = ["Tobit", "Judith", "Wisdom", "Sirach", "Baruch", "1 Maccabees", "2 Maccabees"];

    // --- DOM Elements ---
    const scriptureDisplay = document.getElementById('scripture-display');
    const initialMessage = document.getElementById('initial-message');
    const versionSubtitle = document.getElementById('version-subtitle');
    const mobileSidebarContainer = document.getElementById('mobile-sidebar-container');
    const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');
    const openMobileSidebarBtn = document.getElementById('open-mobile-sidebar-btn');
    const closeMobileSidebarBtn = document.getElementById('close-mobile-sidebar-btn');
    const desktopOptionsModal = document.getElementById('desktop-options-modal');
    const openDesktopOptionsBtn = document.getElementById('open-options-modal-btn');
    const closeDesktopOptionsBtn = document.getElementById('close-desktop-options-btn');
    const quoteModal = document.getElementById('quote-modal');
    const closeQuoteModalBtn = document.getElementById('close-quote-modal-btn');
    const quoteBookSelect = document.getElementById('quote-book-select');
    const quoteChapterSelect = document.getElementById('quote-chapter-select');
    const quoteVerseFromEl = document.getElementById('quote-verse-from');
    const quoteVerseToEl = document.getElementById('quote-verse-to');
    const quoteFontSelect = document.getElementById('quote-font-select');
    const generateAndDownloadBtn = document.getElementById('generate-and-download-btn');
    const quoteLoader = document.getElementById('quote-loader');
    const aiModal = document.getElementById('ai-modal');
    const aiModalTitle = document.getElementById('ai-modal-title');
    const aiModalContent = document.getElementById('ai-modal-content');
    const closeAiModalBtn = document.getElementById('close-ai-modal-btn');
    const highlightPopupContainer = document.getElementById('highlight-popup-container');
    const highlightsModal = document.getElementById('highlights-modal');
    const closeHighlightsModalBtn = document.getElementById('close-highlights-modal-btn');
    const highlightsContent = document.getElementById('highlights-content');
    const highlightsCategoryFilter = document.getElementById('highlights-category-filter');
    const apiKeyModal = document.getElementById('api-key-modal');
    const closeApiKeyModalBtn = document.getElementById('close-api-key-modal-btn');
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const closeSearchModalBtn = document.getElementById('close-search-modal-btn');
    const executeSearchBtn = document.getElementById('execute-search-btn');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    // --- Auth DOM Elements ---
    const loginModal = document.getElementById('login-modal');
    const closeLoginModalBtn = document.getElementById('close-login-modal-btn');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const emailLoginBtn = document.getElementById('email-login-btn');
    const emailSignupBtn = document.getElementById('email-signup-btn');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const authError = document.getElementById('auth-error');

    // --- STATE ---
    let currentUser = null;
    let currentFontSize = 1.125;
    let currentFontFamily = 'Tinos';
    let currentBook = 'Genesis';
    let currentChapter = '1';
    let currentTranslationName = '';
    let highlights = {};
    let categories = [];
    let userApiKey = '';
    let afterKeyEntryCallback = null;
    let staticBookData = {};
    let aiFeaturesEnabled = true;
    let toastTimeout;

    const loaderHTML = `<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div><p>Loading...</p>`;

    // --- UI Functions ---
    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        toast.textContent = message;
        
        clearTimeout(toastTimeout);
        
        toast.classList.add('show');
        
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // --- DATA SYNC FUNCTIONS ---
    async function saveData() {
        if (currentUser) {
            await saveDataToFirestore(currentUser.uid);
        } else {
            saveDataToLocalStorage();
        }
    }

    function saveDataToLocalStorage() {
        const settings = {
            translation: document.querySelector('.translation-select').value,
            fontSize: currentFontSize,
            fontFamily: currentFontFamily,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            apiKey: userApiKey,
            aiFeaturesEnabled: aiFeaturesEnabled
        };
        localStorage.setItem('bible_settings', JSON.stringify(settings));
        localStorage.setItem('bible_highlights', JSON.stringify(highlights));
        localStorage.setItem('bible_categories', JSON.stringify(categories));
    }

    async function saveDataToFirestore(userId) {
        const { db, doc, setDoc } = window.firebase;
        const userDocRef = doc(db, "users", userId);
        const dataToSave = {
            highlights,
            categories,
            settings: {
                translation: document.querySelector('.translation-select').value,
                fontSize: currentFontSize,
                fontFamily: currentFontFamily,
                theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
                apiKey: userApiKey,
                aiFeaturesEnabled: aiFeaturesEnabled
            }
        };
        await setDoc(userDocRef, dataToSave, { merge: true });
    }

    async function loadDataForUser(userId) {
        const { db, doc, getDoc } = window.firebase;
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            // Load data from Firestore
            const data = docSnap.data();
            highlights = data.highlights || {};
            categories = data.categories || [];
            if (data.settings) {
                const { translation, fontSize, fontFamily, theme, apiKey, aiFeaturesEnabled: aiEnabled } = data.settings;
                applyTranslation(translation || 'drb', false);
                if (fontSize) { currentFontSize = fontSize; changeFontSize(0, false); }
                applyFontFamily(fontFamily || 'Tinos', false);
                applyTheme(theme || 'dark', false);
                userApiKey = apiKey || '';
                aiFeaturesEnabled = aiEnabled ?? true;
            }
        } else {
            console.log("No data in Firestore, uploading local data.");
            loadDataFromLocalStorage();
            await saveDataToFirestore(userId);
        }
        if (document.getElementById('scripture-display').querySelector('[data-verse-ref]')) {
            getScripture();
        }
        updateAiFeatureVisibility();
    }

    function loadDataFromLocalStorage() {
        const savedSettings = JSON.parse(localStorage.getItem('bible_settings'));
        if (savedSettings) {
            applyTranslation(savedSettings.translation || 'drb', false);
            if (savedSettings.fontSize) { currentFontSize = savedSettings.fontSize; changeFontSize(0, false); }
            applyFontFamily(savedSettings.fontFamily || 'Tinos', false);
            applyTheme(savedSettings.theme || 'dark', false);
            userApiKey = savedSettings.apiKey || '';
            aiFeaturesEnabled = savedSettings.aiFeaturesEnabled ?? true;
        } else {
            applyTranslation('drb', false);
        }
        highlights = JSON.parse(localStorage.getItem('bible_highlights')) || {};
        categories = JSON.parse(localStorage.getItem('bible_categories')) || [];
        updateAiFeatureVisibility();
    }


    // --- AUTH FUNCTIONS ---
    function updateAuthUI(user) {
        const { auth, signOut } = window.firebase;
        const authBtns = document.querySelectorAll('.auth-management-btn');

        if (user) {
            currentUser = user;
            authBtns.forEach(btn => {
                btn.textContent = `Logout (${user.displayName || user.email})`;
                btn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
                btn.classList.add('bg-red-600', 'hover:bg-red-700');
                btn.onclick = () => signOut(auth);
            });
            loginModal.classList.add('hidden');
            loadDataForUser(user.uid);
        } else {
            currentUser = null;
            authBtns.forEach(btn => {
                btn.textContent = 'Login / Sign Up';
                btn.classList.remove('bg-red-600', 'hover:bg-red-700');
                btn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
                btn.onclick = () => {
                    loginModal.classList.remove('hidden');
                    clearAuthError();
                };
            });
            loadDataFromLocalStorage();
        }
    }

    function showAuthError(message) {
        authError.textContent = message;
        authError.classList.remove('hidden');
    }

    function clearAuthError() {
        authError.textContent = '';
        authError.classList.add('hidden');
    }

    // --- BIBLE FUNCTIONS ---
    async function getSmartVersionName(book, customVersion) {
        const isDeuterocanonical = DEUTEROCANONICAL_BOOKS.includes(book);
        let specificError = `If the version is real but does not contain "${book}" and has no common Catholic/Ecumenical alternative, set "error" to "The book of ${book} is not found in the ${customVersion} translation. Please try a version that includes the Deuterocanonical books.".`;

        if (isDeuterocanonical) {
            specificError = `If the version is real but does not contain the deuterocanonical book "${book}", set "error" to "The book of ${book} is not found in the ${customVersion} translation. Please use a version that includes the Deuterocanon, such as: NRSV-CE, RSV-CE, Douay-Rheims (DRB), NABRE, New Jerusalem Bible (NJB), or the Knox Bible (KNOX)."`;
        }
        
        const prompt = `Analyze the Bible translation "${customVersion}" for the book of "${book}". Respond ONLY with a JSON object with this exact schema: {"isReal": boolean, "finalVersion": "string", "error": "string or null"}.
        1.  "isReal": Is "${customVersion}" a real, recognized Bible translation?
        2.  If "${book}" is a Deuterocanonical book, check if "${customVersion}" typically includes it. 
        3.  If it does not, but a well-known Catholic or Ecumenical edition exists (e.g., "NRSV Catholic Edition" for "NRSV"), set "finalVersion" to that full, official name.
        4.  If the version is not real, set "error" to "'${customVersion}' is not a recognized Bible translation." and "isReal" to false.
        5.  ${specificError}
        6.  If the version is valid for the book, set "finalVersion" to the full, official name of the requested translation and "error" to null. For example, if a user enters "NRSVCE", the finalVersion should be "New Revised Standard Version Catholic Edition".`;

        const jsonString = await callGemini(prompt);
        try {
            const cleanedJsonString = jsonString.replace(/```json\n?|```/g, '').trim();
            const data = JSON.parse(cleanedJsonString);

            if (data.error) {
                throw new Error(data.error);
            }
            if (!data.isReal) {
                 throw new Error(`"${customVersion}" is not a recognized Bible translation.`);
            }
            return data.finalVersion;

        } catch (e) {
             console.error("Failed to parse JSON from Gemini for version check.", e);
             throw new Error(e.message || "Could not validate the custom Bible version.");
        }
    }


    function populateBooks(selectElement) {
        selectElement.innerHTML = '';
        Object.keys(BIBLE_BOOKS).forEach(testament => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = testament;
            Object.keys(BIBLE_BOOKS[testament]).forEach(bookName => {
                const option = document.createElement('option');
                option.value = bookName;
                option.textContent = bookName;
                optgroup.appendChild(option);
            });
            selectElement.appendChild(optgroup);
        });
    }

    function populateChapters(bookSelect, chapterSelect) {
        const book = bookSelect.value;
        let chapterCount = 0;
        if (BIBLE_BOOKS["Old Testament"][book]) chapterCount = BIBLE_BOOKS["Old Testament"][book];
        else if (BIBLE_BOOKS["New Testament"][book]) chapterCount = BIBLE_BOOKS["New Testament"][book];
        chapterSelect.innerHTML = '';
        for (let i = 1; i <= chapterCount; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Chapter ${i}`;
            chapterSelect.appendChild(option);
        }
    }

    async function getScriptureFromGeminiForChapter(book, chapter, versionName) {
        const prompt = `Please provide the full text for ${book} chapter ${chapter} from the "${versionName}" translation of the Bible. Respond ONLY with a JSON object that mimics the bible-api.com structure. The JSON object should have these keys: "reference", "translation_name", and "verses". The "translation_name" should be the full name of the version requested. The "verses" key should be an array of objects, where each object has a "verse" (as a number) and "text" (as a string) key.`;

        const jsonString = await callGemini(prompt);
        try {
            const cleanedJsonString = jsonString.replace(/```json\n?|```/g, '').trim();
            const data = JSON.parse(cleanedJsonString);
            if (data.reference && data.verses && Array.isArray(data.verses)) {
                return data;
            } else {
                throw new Error("AI returned incomplete or malformed JSON data.");
            }
        } catch (e) {
            console.error("Failed to parse JSON from Gemini for chapter fetch.", e);
            throw new Error("The AI returned an invalid response. It might not recognize this version or the format was incorrect.");
        }
    }

    async function parseAndFetchVerse(inputString) {
        if (!inputString) return;

        const allBookNames = [
            ...Object.keys(BIBLE_BOOKS["Old Testament"]),
            ...Object.keys(BIBLE_BOOKS["New Testament"])
        ];
        const sortedBooks = [...allBookNames].sort((a, b) => b.length - a.length);

        let foundBook = null;
        let remainingString = '';

        for (const bookName of sortedBooks) {
            if (inputString.toLowerCase().startsWith(bookName.toLowerCase())) {
                foundBook = bookName;
                remainingString = inputString.substring(bookName.length).trim();
                break;
            }
        }

        if (!foundBook) {
            alert("Could not recognize the book name. Please use a standard name (e.g., Genesis, 1 Corinthians).");
            return;
        }
        
        const parts = remainingString.match(/^(\d+)(?:\s*[:.]\s*(\d+))?/);
        if (!parts || !parts[1]) {
            alert(`Invalid chapter/verse format after "${foundBook}". Please use a format like " 1:15".`);
            return;
        }

        const chapter = parts[1];
        const startVerse = parts[2];

        document.querySelectorAll('.book-select').forEach(select => {
            select.value = foundBook;
            const controlsContainer = select.closest('.grid, .space-y-4');
            const chapterSelect = controlsContainer.querySelector('.chapter-select');
            if (chapterSelect) {
                populateChapters(select, chapterSelect);
                chapterSelect.value = chapter;
            }
        });
         document.querySelectorAll('.chapter-select').forEach(select => select.value = chapter);


        currentBook = foundBook;
        currentChapter = chapter;

        await getScripture();

        if (startVerse) {
            setTimeout(() => {
                const verseRef = `${foundBook} ${chapter}:${startVerse}`;
                const verseElement = document.querySelector(`[data-verse-ref="${verseRef}"]`);
                if (verseElement) {
                    verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    verseElement.style.transition = 'background-color 0.5s ease';
                    verseElement.style.backgroundColor = 'rgba(99, 102, 241, 0.4)';
                    setTimeout(() => {
                        verseElement.style.backgroundColor = '';
                    }, 2500);
                }
            }, 500);
        }
    }


    async function getScripture() {
        const controls = document.getElementById('main-controls').offsetParent ? 
                         document.getElementById('main-controls') : 
                         document.getElementById('mobile-sidebar-controls');

        currentBook = controls.querySelector('.book-select').value;
        currentChapter = controls.querySelector('.chapter-select').value;
        const translationSelect = controls.querySelector('.translation-select');
        const customVersionInput = controls.querySelector('.custom-version-input');
        
        const translation = translationSelect.value;
        const customVersion = customVersionInput.value.trim();

        if (!currentBook || !currentChapter) return;
        if (translation === 'custom' && !customVersion) {
            alert('Please enter a custom version name.');
            return;
        }
        
        if(initialMessage) initialMessage.style.display = 'none';
        scriptureDisplay.innerHTML = `<div class="text-center">${loaderHTML}</div>`;
        
        toggleMobileSidebar(false);

        try {
            let data;
            const selectedOption = translationSelect.options[translationSelect.selectedIndex];

            if (translation === 'cpdv' || translation === 'drb') {
                const baseUrl = selectedOption.dataset.baseUrl;
                const bookFileName = `${encodeURIComponent(currentBook)}.json`;
                const bookUrl = `${baseUrl}/${bookFileName}`;
                
                if (!staticBookData[bookUrl]) {
                    scriptureDisplay.innerHTML = `<div class="text-center">${loaderHTML} <p>Downloading ${currentBook}...</p></div>`;
                    const response = await fetch(bookUrl);
                    if (!response.ok) throw new Error(`Could not find or download the file for ${currentBook}. Check the book name and URL.`);
                    staticBookData[bookUrl] = await response.json();
                }

                const bookData = staticBookData[bookUrl];
                const chapterData = bookData[currentChapter];

                if (!chapterData) throw new Error("Chapter not found in the downloaded file.");

                data = {
                    reference: `${currentBook} ${currentChapter}`,
                    translation_name: selectedOption.dataset.name,
                    verses: Object.keys(chapterData).filter(key => !isNaN(key)).map(verseNum => ({
                        verse: verseNum,
                        text: chapterData[verseNum]
                    }))
                };

            } else if (translation === 'custom' && customVersion) {
                const finalVersionName = await getSmartVersionName(currentBook, customVersion);
                data = await getScriptureFromGeminiForChapter(currentBook, currentChapter, finalVersionName);
            } else {
                const apiUrl = `https://bible-api.com/${encodeURIComponent(currentBook)}+${currentChapter}?translation=${translation}`;
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error((await response.json()).error || `Network response was not ok`);
                data = await response.json();
            }

            if (data && data.verses && data.verses.length > 0) {
                currentTranslationName = data.translation_name;
                versionSubtitle.textContent = currentTranslationName;
                document.getElementById('mobile-version-subtitle').textContent = currentTranslationName;
                let titleHtml = `<h2 class="text-3xl font-bold mb-4 pb-3">${data.reference}</h2>`;
                
                let aiToolsHtml = `
                    <div class="ai-feature ai-tools-strip my-4 py-2 border-y border-gray-200 dark:border-gray-700 text-base">
                        <button id="ai-tools-toggle" class="w-full flex justify-between items-center text-left p-1">
                            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">AI Tools</h3>
                            <svg id="ai-tools-chevron" class="w-4 h-4 transition-transform text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div id="ai-tools-content" class="hidden mt-3">
                            <div class="flex flex-wrap justify-center gap-2">
                                <button class="summarize-btn bg-blue-600 text-white font-bold py-1 px-3 rounded-md hover:bg-blue-700 transition inline-flex items-center text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h4a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>
                                    Summarize
                                </button>
                                <button class="explain-btn bg-purple-600 text-white font-bold py-1 px-3 rounded-md hover:bg-purple-700 transition inline-flex items-center text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>
                                    Explain
                                </button>
                            </div>
                        </div>
                    </div>`;
                
                const chapterHighlights = {};
                const prefix = `${currentBook} ${currentChapter}:`;
                for (const ref in highlights) {
                    if (ref.startsWith(prefix)) {
                        const versePart = ref.substring(prefix.length);
                        const [startStr, endStr] = versePart.split('-');
                        const start = parseInt(startStr);
                        const end = endStr ? parseInt(endStr) : start;
                        for (let i = start; i <= end; i++) {
                            chapterHighlights[i] = highlights[ref].color;
                        }
                    }
                }

                let versesHtml = '<div class="space-y-4">';
                data.verses.forEach(verseData => {
                    const verseRef = `${currentBook} ${currentChapter}:${verseData.verse}`;
                    const color = chapterHighlights[verseData.verse];
                    const highlightClass = color ? `highlight-${color}` : '';
                    versesHtml += `<p class="cursor-pointer rounded-md p-1 -m-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${highlightClass}" data-verse-ref="${verseRef}"><sup class="text-indigo-500 font-bold mr-1.5">${verseData.verse}</sup>${verseData.text.replace(/\n/g, ' ').trim()}</p>`;
                });
                versesHtml += '</div>';

                scriptureDisplay.innerHTML = titleHtml + aiToolsHtml + versesHtml;
                updateAiFeatureVisibility();
                
                const aiToolsToggle = scriptureDisplay.querySelector('#ai-tools-toggle');
                if (aiToolsToggle) {
                    const aiToolsContent = scriptureDisplay.querySelector('#ai-tools-content');
                    const aiToolsChevron = scriptureDisplay.querySelector('#ai-tools-chevron');

                    aiToolsToggle.addEventListener('click', () => {
                        aiToolsContent.classList.toggle('hidden');
                        aiToolsChevron.classList.toggle('rotate-180');
                    });

                    aiToolsContent.querySelector('.summarize-btn').addEventListener('click', getSummary);
                    aiToolsContent.querySelector('.explain-btn').addEventListener('click', getExplanation);
                }

                scriptureDisplay.querySelectorAll('[data-verse-ref]').forEach(el => {
                    el.addEventListener('click', showHighlightPopup);
                });

            } else { 
                throw new Error("Passage not found or returned no data."); 
            }
        } catch (error) {
            console.error(`Error fetching scripture:`, error);
            scriptureDisplay.innerHTML = `<div class="text-center text-red-500 p-4"><h3 class="font-bold text-lg mb-2">Error</h3><p>${error.message}</p></div>`;
        }
    }
    
    // --- UI Settings ---
    function applyTranslation(value, shouldSave = true) {
        document.querySelectorAll('.translation-select').forEach(el => el.value = value);
        const selectedOption = document.querySelector('.translation-select option:checked');
        if (selectedOption && value !== 'custom') {
            const versionName = selectedOption.dataset.name;
            versionSubtitle.textContent = versionName;
            document.getElementById('mobile-version-subtitle').textContent = versionName;
        }
        if(shouldSave) saveData();
    }
    function changeFontSize(amount, shouldSave = true) {
        const newSize = Math.max(0.875, Math.min(1.5, currentFontSize + amount));
        currentFontSize = newSize;
        document.documentElement.style.setProperty('--font-size-base', `${newSize}rem`);
        document.documentElement.style.setProperty('--line-height-base', `${newSize * 1.5}rem`);
        if(shouldSave) saveData();
    }
    function applyFontFamily(fontName, shouldSave = true) {
        currentFontFamily = fontName;
        document.documentElement.style.setProperty('--font-family-base', `"${fontName}"`);
        document.querySelectorAll('.font-family-select').forEach(el => el.value = fontName);
        if(shouldSave) saveData();
    }

    function applyTheme(theme, shouldSave = true) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.querySelectorAll('.theme-icon-light').forEach(el => el.classList.toggle('hidden', theme === 'dark'));
        document.querySelectorAll('.theme-icon-dark').forEach(el => el.classList.toggle('hidden', theme !== 'dark'));
        if(shouldSave) saveData();
    }
    
    function toggleTheme() {
        const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(newTheme);
    }
    
    function toggleAiFeatures() {
        aiFeaturesEnabled = !aiFeaturesEnabled;
        saveData();
        updateAiFeatureVisibility();
        syncVersionControls(document.querySelector('.translation-select'));
    }
    
    function updateAiFeatureVisibility() {
        const features = document.querySelectorAll('.ai-feature');
        features.forEach(el => {
            el.classList.toggle('hidden', !aiFeaturesEnabled);
        });
        document.querySelectorAll('.ai-toggle-bg').forEach(el => {
            el.classList.toggle('enabled', aiFeaturesEnabled);
        });
         if (!aiFeaturesEnabled && document.querySelector('.translation-select').value === 'custom') {
            applyTranslation('drb');
            syncVersionControls(document.querySelector('.translation-select'));
        }
    }

    // --- Sidebar Logic ---
    function toggleMobileSidebar(show) {
        mobileSidebarContainer.classList.toggle('sidebar-closed-left', !show);
    }
    function toggleDesktopOptions(show) {
        document.getElementById('desktop-options-modal').classList.toggle('hidden', !show);
    }
    
    // --- Modals ---
    function openQuoteModal() {
        const controls = document.getElementById('main-controls').offsetParent ? 
                         document.getElementById('main-controls') : 
                         document.getElementById('mobile-sidebar-controls');
        
        const book = controls.querySelector('.book-select').value;
        const chapter = controls.querySelector('.chapter-select').value;

        populateBooks(quoteBookSelect);
        quoteBookSelect.value = book;
        populateChapters(quoteBookSelect, quoteChapterSelect);
        quoteVerseFromEl.value = '';
        quoteVerseToEl.value = '';
        
        const quoteTranslationSelect = document.getElementById('translation-select-quote');
        const customVersionContainer = document.getElementById('quote-custom-version-container');
        quoteTranslationSelect.value = 'drb';
        customVersionContainer.classList.add('hidden');
        document.getElementById('quote-custom-version').value = '';

        quoteModal.classList.remove('hidden');
    }
    function closeQuoteModal() { quoteModal.classList.add('hidden'); }
    
    async function getScriptureFromGemini(book, chapter, verseRange, versionName) {
        const prompt = `Please provide the text for ${book} ${chapter}:${verseRange} from the "${versionName}" translation of the Bible. Respond ONLY with a JSON object with two keys: "text" (the full verse text as a single string) and "abbreviation" (the standard abbreviation for the version, e.g., "NIV", "ESV", "NRSVCE", "KNOX", "DRV").`;
        
        const jsonString = await callGemini(prompt);
        
        try {
            const cleanedJsonString = jsonString.replace(/```json\n?|```/g, '').trim();
            const data = JSON.parse(cleanedJsonString);
            if (data.text && data.abbreviation) {
                return data;
            } else {
                console.warn("AI returned malformed JSON, falling back to text-only response.");
                const abbreviation = versionName.split(' ').map(w => w[0]).join('').toUpperCase();
                return { text: cleanedJsonString, abbreviation: abbreviation };
            }
        } catch (e) {
            console.error("Failed to parse JSON from Gemini. Treating response as plain text.", e);
            const abbreviation = versionName.split(' ').map(w => w[0]).join('').toUpperCase();
            return { text: jsonString, abbreviation: abbreviation };
        }
    }

    async function generateAndDownloadQuote() {
        const verseFrom = quoteVerseFromEl.value;
        const verseTo = quoteVerseToEl.value || verseFrom;
        if (!verseFrom) { alert('Please enter a starting verse.'); return; }

        const generateBtn = document.getElementById('generate-and-download-btn');
        quoteLoader.innerHTML = loaderHTML;
        quoteLoader.classList.remove('hidden');
        generateBtn.disabled = true;

        const book = quoteBookSelect.value;
        const chapter = quoteChapterSelect.value;
        const verseRange = verseFrom === verseTo ? verseFrom : `${verseFrom}-${verseTo}`;
        const customVersion = document.getElementById('quote-custom-version').value.trim();

        try {
            let verseText = '';
            let refText = '';
            let shortVersionName = '';

            const translationSelect = document.getElementById('translation-select-quote');
            const translation = translationSelect.value;
            const selectedOption = translationSelect.options[translationSelect.selectedIndex];

            if (translation === 'custom' && customVersion) {
                const finalVersionName = await getSmartVersionName(book, customVersion);
                const scriptureData = await getScriptureFromGemini(book, chapter, verseRange, finalVersionName);
                verseText = scriptureData.text;
                shortVersionName = scriptureData.abbreviation;
                refText = `— ${book} ${chapter}:${verseRange} (${shortVersionName})`;
            } else if (translation === 'drb' || translation === 'cpdv') {
                const baseUrls = {
                    drb: 'https://exanx.github.io/bible-json/DRB-73-Books',
                    cpdv: 'https://exanx.github.io/bible-json/CPDV-73-Books'
                };
                const baseUrl = baseUrls[translation];
                const bookFileName = `${encodeURIComponent(book)}.json`;
                const bookUrl = `${baseUrl}/${bookFileName}`;

                if (!staticBookData[bookUrl]) {
                    const response = await fetch(bookUrl);
                    if (!response.ok) throw new Error(`Could not download the file for ${book}.`);
                    staticBookData[bookUrl] = await response.json();
                }

                const bookData = staticBookData[bookUrl];
                const chapterData = bookData[chapter];
                if (!chapterData) throw new Error(`Chapter ${chapter} not found in the file for ${book}.`);
                
                let versesToQuote = [];
                for (let i = parseInt(verseFrom); i <= parseInt(verseTo); i++) {
                    if (chapterData[i]) {
                        versesToQuote.push(chapterData[i]);
                    }
                }
                if (versesToQuote.length === 0) throw new Error(`Verses ${verseRange} not found.`);

                verseText = versesToQuote.join(' ');
                shortVersionName = selectedOption.text;
                refText = `— ${book} ${chapter}:${verseRange} (${shortVersionName})`;
            } else {
                const apiUrl = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}:${verseRange}?translation=${translation}`;
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error((await response.json()).error);
                const data = await response.json();
                
                verseText = data.verses.map(v => v.text.replace(/\n/g, ' ').trim()).join(' ');
                shortVersionName = selectedOption.text;
                refText = `— ${data.reference} (${shortVersionName})`;
            }
            
            await downloadCanvasQuote({ text: verseText, ref: refText });
            quoteLoader.classList.add('hidden');

        } catch (error) {
            quoteLoader.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        } finally {
            generateBtn.disabled = false;
        }
    }

    async function downloadCanvasQuote(quoteData) {
        const { text, ref } = quoteData;
        const selectedFont = quoteFontSelect.value;
        const minWidth = 1500;
        const minHeight = 1000;
        const padding = 120;
        const textMaxWidth = minWidth - (padding * 2);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const verseFontSize = 80;
        const verseLineHeight = verseFontSize * 1.4;
        const verseFont = `italic ${verseFontSize}px "${selectedFont}"`;
        
        const refFontSize = 50;
        const refFont = `${refFontSize}px Inter`;

        try {
            await document.fonts.load(verseFont);
            await document.fonts.load(refFont);
        } catch (err) {
            console.error('Font could not be loaded, using fallback:', err);
        }
        
        function wrapText(context, text, x, y, maxWidth, lineHeight, font, color) {
            context.font = font;
            context.fillStyle = color;
            context.textAlign = 'center';
            const words = text.split(' ');
            let line = '';
            let lines = [];

            for(let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = context.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);
            
            const totalTextHeight = lines.length * lineHeight;
            let startY = y - (totalTextHeight / 2);

            for(let i = 0; i < lines.length; i++) {
                context.fillText(lines[i].trim(), x, startY + (i * lineHeight));
            }
            return totalTextHeight;
        }

        ctx.font = verseFont;
        const verseWords = text.split(' ');
        let line = '';
        let lineCount = 1;
        for(let n = 0; n < verseWords.length; n++) {
            const testLine = line + verseWords[n] + ' ';
            if (ctx.measureText(testLine).width > textMaxWidth && n > 0) {
                lineCount++;
                line = verseWords[n] + ' ';
            } else {
                line = testLine;
            }
        }
        const verseBlockHeight = lineCount * verseLineHeight;
        const refBlockHeight = refFontSize * 1.4;
        const totalContentHeight = verseBlockHeight + refBlockHeight + 40;
        
        canvas.width = minWidth;
        canvas.height = Math.max(minHeight, totalContentHeight + (padding * 2));
        
        const isDarkMode = document.documentElement.classList.contains('dark');
        ctx.fillStyle = document.getElementById('quote-bg-color').value;
        const textColor = document.getElementById('quote-text-color').value;
        const refColor = isDarkMode ? '#9CA3AF' : '#4B5563';

        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerY = canvas.height / 2;
        const centerX = canvas.width / 2;

        const totalTextHeight = wrapText(ctx, text, centerX, centerY, textMaxWidth, verseLineHeight, verseFont, textColor);
        
        ctx.font = refFont;
        ctx.fillStyle = refColor;
        ctx.textAlign = 'center';
        ctx.fillText(ref, centerX, centerY + (totalTextHeight / 2) + 40);

        const link = document.createElement('a');
        const fileName = `bible-quote-${ref.replace(/[ :().]/g, '_')}.png`;
        link.download = fileName.replace(/__/g, '_');
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    async function callGemini(prompt) {
        if (!userApiKey) {
            openApiKeyModal(() => callGemini(prompt));
            throw new Error("API key not set.");
        }
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${userApiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid response structure from API.");
        }
    }

    function openAiModal(title, content) {
        aiModalTitle.textContent = title;
        aiModalContent.innerHTML = content;
        aiModal.classList.remove('hidden');
    }
    
    function closeAiModal() {
        aiModal.classList.add('hidden');
    }

    async function getSummary() {
        if (!userApiKey) {
            openApiKeyModal(getSummary);
            return;
        }
        const prompt = `Summarize the key events and themes of ${currentBook} chapter ${currentChapter}. Start your response directly with the summary, for example: '${currentBook} chapter ${currentChapter} describes...'`;
        openAiModal(`Summary of ${currentBook} ${currentChapter}`, loaderHTML);
        try {
            const summary = await callGemini(prompt);
            aiModalContent.innerHTML = marked.parse(summary);
        } catch (error) {
            aiModalContent.textContent = "Sorry, an error occurred while generating the summary.";
            console.error("Summary Error:", error);
        }
    }
    
    async function getExplanation() {
        if (!userApiKey) {
            openApiKeyModal(getExplanation);
            return;
        }
        const prompt = `Explain the key themes and theological significance of ${currentBook} chapter ${currentChapter} from a Catholic perspective. Start your response directly with the explanation, for example: '${currentBook} chapter ${currentChapter} is significant because...'`;
        openAiModal(`Explanation of ${currentBook} ${currentChapter}`, loaderHTML);
        try {
            const explanation = await callGemini(prompt);
            aiModalContent.innerHTML = marked.parse(explanation);
        } catch (error) {
            aiModalContent.textContent = "Sorry, an error occurred while generating the explanation.";
            console.error("Explanation Error:", error);
        }
    }

    // --- Verse Action Popup & Highlighting ---
    function getVerseRangeText() {
        const fromVerse = parseInt(document.getElementById('popup-verse-from').value);
        const toVerse = parseInt(document.getElementById('popup-verse-to').value);
        if (isNaN(fromVerse) || isNaN(toVerse) || fromVerse > toVerse) {
            return { text: '', reference: '' };
        }

        let verses = [];
        for (let i = fromVerse; i <= toVerse; i++) {
            const verseRef = `${currentBook} ${currentChapter}:${i}`;
            const verseElement = document.querySelector(`[data-verse-ref="${verseRef}"]`);
            if (verseElement) {
                verses.push(verseElement.textContent.replace(/^\d+/, '').trim());
            }
        }

        const verseRangeStr = fromVerse === toVerse ? fromVerse : `${fromVerse}-${toVerse}`;
        const fullReference = `${currentBook} ${currentChapter}:${verseRangeStr}`;

        return { text: verses.join(' '), reference: fullReference };
    }

    function showHighlightPopup(e) {
        const verseElement = e.currentTarget;
        const verseRef = verseElement.dataset.verseRef;
        
        const parts = verseRef.match(/(.*?)\s+(\d+):(\d+)/);
        if (!parts) return;
        const book = parts[1];
        const chapter = parts[2];
        const verse = parseInt(parts[3]);

        highlightPopupContainer.dataset.currentBook = book;
        highlightPopupContainer.dataset.currentChapter = chapter;

        const fromInput = document.getElementById('popup-verse-from');
        const toInput = document.getElementById('popup-verse-to');
        fromInput.value = verse;
        toInput.value = verse;
        
        const noteInput = document.getElementById('highlight-note-input');
        const notePreview = document.getElementById('highlight-note-preview');

        // Check if the clicked verse is part of an existing highlight range
        let foundHighlight = null;
        let foundRef = '';
        const prefix = `${book} ${chapter}:`;
        for (const ref in highlights) {
            if (ref.startsWith(prefix)) {
                const versePart = ref.substring(prefix.length);
                const [startStr, endStr] = versePart.split('-');
                const start = parseInt(startStr);
                const end = endStr ? parseInt(endStr) : start;
                if (verse >= start && verse <= end) {
                    foundHighlight = highlights[ref];
                    fromInput.value = start;
                    toInput.value = end;
                    foundRef = ref;
                    break;
                }
            }
        }
        
        highlightPopupContainer.dataset.originalRef = foundRef;
        updateVerseRefDisplay();
        highlightPopupContainer.classList.remove('hidden');
        
        noteInput.value = foundHighlight?.note || '';
        notePreview.innerHTML = marked.parse(noteInput.value);

        if (noteInput.value) {
            noteInput.classList.add('hidden');
            notePreview.classList.remove('hidden');
        } else {
            noteInput.classList.remove('hidden');
            notePreview.classList.add('hidden');
        }
        
        populateCategorySelect(document.getElementById('highlight-category-select'), foundHighlight?.category);
        
        document.querySelectorAll('#highlight-popup .color-swatch').forEach(swatch => {
            swatch.classList.remove('selected');
            if (foundHighlight && swatch.dataset.color === foundHighlight.color) {
                swatch.classList.add('selected');
            }
        });
    }
    
    function updateVerseRefDisplay() {
        const book = highlightPopupContainer.dataset.currentBook;
        const chapter = highlightPopupContainer.dataset.currentChapter;
        const fromVerse = document.getElementById('popup-verse-from').value;
        const toVerse = document.getElementById('popup-verse-to').value;
        const display = document.getElementById('highlight-verse-ref-display');
        
        if (!book || !chapter || !fromVerse || !toVerse) return;

        if (parseInt(fromVerse) === parseInt(toVerse)) {
            display.textContent = `${book} ${chapter}:${fromVerse}`;
        } else if (parseInt(fromVerse) < parseInt(toVerse)) {
            display.textContent = `${book} ${chapter}:${fromVerse}-${toVerse}`;
        } else {
             display.textContent = `${book} ${chapter}:${fromVerse}`;
        }
    }

    function hideHighlightPopup() {
        highlightPopupContainer.classList.add('hidden');
    }

    function saveHighlight() {
        const fromVerse = parseInt(document.getElementById('popup-verse-from').value);
        const toVerse = parseInt(document.getElementById('popup-verse-to').value);
        if (isNaN(fromVerse) || isNaN(toVerse) || fromVerse > toVerse) return;

        const originalRef = highlightPopupContainer.dataset.originalRef;
        const note = document.getElementById('highlight-note-input').value;
        const category = document.getElementById('highlight-category-select').value;
        const selectedColorEl = document.querySelector('#highlight-popup .color-swatch.selected');
        const color = selectedColorEl ? selectedColorEl.dataset.color : 'yellow';

        const newRef = fromVerse === toVerse 
            ? `${currentBook} ${currentChapter}:${fromVerse}` 
            : `${currentBook} ${currentChapter}:${fromVerse}-${toVerse}`;
        
        if (originalRef && originalRef !== newRef) {
            delete highlights[originalRef];
        }

        highlights[newRef] = { color, note, category };
        
        getScripture(); 
        saveData();
        hideHighlightPopup();
    }
    
    function removeHighlight() {
        const fromVerse = parseInt(document.getElementById('popup-verse-from').value);
        const toVerse = parseInt(document.getElementById('popup-verse-to').value);
        if (isNaN(fromVerse) || isNaN(toVerse) || fromVerse > toVerse) return;

        const originalRef = highlightPopupContainer.dataset.originalRef;
        if (originalRef) {
             delete highlights[originalRef];
        }
        
        getScripture(); 
        saveData();
        hideHighlightPopup();
    }

    function resetApp() {
        const confirmationMessage = currentUser 
            ? 'Are you sure you want to reset the entire app? All highlights, notes, categories, and settings will be permanently deleted from your account and this device.'
            : 'Are you sure you want to reset the entire app? All highlights, notes, categories, and settings will be permanently deleted from this device.';
        
        if (confirm(confirmationMessage)) {
            if (currentUser) {
                const { db, doc, setDoc } = window.firebase;
                const userDocRef = doc(db, "users", currentUser.uid);
                setDoc(userDocRef, {}); // Overwrite with empty data
            }
            localStorage.removeItem('bible_settings');
            localStorage.removeItem('bible_highlights');
            localStorage.removeItem('bible_categories');
            localStorage.removeItem('gemini_api_key');
            window.location.reload();
        }
    }

    function openHighlightsModal() {
        renderHighlights();
        highlightsModal.classList.remove('hidden');
    }

    function closeHighlightsModal() {
        highlightsModal.classList.add('hidden');
    }
    
    function populateCategorySelect(selectEl, selectedCategory) {
        selectEl.innerHTML = '<option value="">Uncategorized</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            if (cat === selectedCategory) {
                option.selected = true;
            }
            selectEl.appendChild(option);
        });
    }

    function addCategory() {
        const input = document.getElementById('new-category-input');
        const newCategory = input.value.trim();
        if (newCategory && !categories.includes(newCategory)) {
            categories.push(newCategory);
            categories.sort();
            saveData();
            populateCategorySelect(document.getElementById('highlight-category-select'), newCategory);
        }
        input.value = '';
    }

    function renderHighlights(filterCategory = null) {
        const allTags = new Set();
        Object.values(highlights).forEach(h => {
            if (h.category) allTags.add(h.category);
        });

        const tagsContainer = document.getElementById('highlights-category-filter');
        tagsContainer.innerHTML = `<button class="tag-btn ${!filterCategory ? 'selected' : ''} bg-gray-200 dark:bg-gray-700 text-xs font-semibold px-3 py-1 rounded-full" data-category="all">Show All</button>`;
        [...allTags].sort().forEach(tag => {
            tagsContainer.innerHTML += `<button class="tag-btn ${filterCategory === tag ? 'selected' : ''} bg-gray-200 dark:bg-gray-700 text-xs font-semibold px-3 py-1 rounded-full" data-category="${tag}">${tag}</button>`;
        });
        
        tagsContainer.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                renderHighlights(category === 'all' ? null : category);
            });
        });


        if (Object.keys(highlights).length === 0) {
            highlightsContent.innerHTML = `<p class="text-gray-500 dark:text-gray-400">You haven't highlighted any verses yet.</p>`;
            return;
        }

        const groupedByBook = {};
        for (const ref in highlights) {
            const highlight = highlights[ref];
            if (filterCategory && highlight.category !== filterCategory) {
                continue;
            }
            const book = ref.substring(0, ref.lastIndexOf(' '));
            if (!groupedByBook[book]) {
                groupedByBook[book] = [];
            }
            groupedByBook[book].push(ref);
        }

        let html = '';
        if (Object.keys(groupedByBook).length === 0) {
             highlightsContent.innerHTML = `<p class="text-gray-500 dark:text-gray-400">No highlights found for this category.</p>`;
             return;
        }

        for (const book in groupedByBook) {
            html += `<h3 class="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">${book}</h3>`;
            groupedByBook[book].sort((a, b) => {
                const aParts = a.match(/:(\d+)/);
                const bParts = b.match(/:(\d+)/);
                return (aParts ? parseInt(aParts[1]) : 0) - (bParts ? parseInt(bParts[1]) : 0);
            }).forEach(ref => {
                const highlight = highlights[ref];
                
                const versePart = ref.substring(ref.lastIndexOf(':') + 1);
                const firstVerseNum = versePart.split('-')[0];
                const firstVerseRef = ref.substring(0, ref.lastIndexOf(':') + 1) + firstVerseNum;
                
                const verseText = document.querySelector(`[data-verse-ref="${firstVerseRef}"]`)?.textContent.replace(/^\d+/, '').trim() || 'Verse text not currently loaded. Please navigate to the chapter to view.';
                
                let categoryHtml = '';
                if (highlight.category) {
                    categoryHtml = `<span class="bg-gray-200 dark:bg-gray-600 text-xs font-semibold px-2 py-1 rounded-full">${highlight.category}</span>`;
                }
                const note = highlight.note || '';
                const noteIsHidden = note ? '' : 'hidden';
                const textareaIsHidden = note ? 'hidden' : '';

                html += `
                    <div class="mb-4 p-4 border-l-4 border-${highlight.color}-400 bg-gray-100 dark:bg-gray-800 rounded-r-lg">
                        <div class="flex justify-between items-center">
                            <p class="font-semibold text-gray-800 dark:text-gray-200">${ref}</p>
                            ${categoryHtml}
                        </div>
                        <p class="italic text-gray-600 dark:text-gray-300 mt-2">"${verseText}"</p>
                        <div class="note-container mt-2">
                            <textarea class="note-textarea w-full p-2 bg-white dark:bg-gray-700 rounded-md text-sm ${textareaIsHidden}" data-note-ref="${ref}" placeholder="Add a note...">${note}</textarea>
                            <div class="note-preview prose prose-sm dark:prose-invert max-w-none p-2 bg-white dark:bg-gray-700 rounded-md min-h-[40px] cursor-text ${noteIsHidden}" data-preview-ref="${ref}">${marked.parse(note)}</div>
                            <button class="save-note-btn mt-2 bg-indigo-600 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-indigo-700" data-save-ref="${ref}">Save Note</button>
                        </div>
                    </div>
                `;
            });
        }
        highlightsContent.innerHTML = html;
    }

    function openApiKeyModal(callback) {
        afterKeyEntryCallback = callback;
        apiKeyInput.value = userApiKey;
        apiKeyModal.classList.remove('hidden');
    }

    function closeApiKeyModal() {
        apiKeyModal.classList.add('hidden');
    }

    function saveApiKey() {
        const newKey = apiKeyInput.value.trim();
        if (newKey) {
            userApiKey = newKey;
            saveData();
            closeApiKeyModal();
            if (afterKeyEntryCallback) {
                afterKeyEntryCallback();
                afterKeyEntryCallback = null;
            }
        } else {
            alert('Please enter a valid API key.');
        }
    }
    
    function setupDirectVerseSearch() {
        const inputs = document.querySelectorAll('.direct-verse-input');
        const buttons = document.querySelectorAll('.direct-verse-search-btn');

        const handleSearch = (eventSource) => {
            const value = eventSource.value;
            parseAndFetchVerse(value);
        };

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const inputField = e.target.previousElementSibling;
                handleSearch(inputField);
            });
        });

        inputs.forEach(input => {
            input.addEventListener('keypress', e => {
                if (e.key === 'Enter') {
                    handleSearch(e.target);
                }
            });
            input.addEventListener('input', e => {
                inputs.forEach(i => { if (i !== e.target) i.value = e.target.value; });
            });
        });
    }

    // --- INITIALIZATION ---
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
    const selectorsTemplate = document.getElementById('selectors-template');
    const optionsTemplate = document.getElementById('options-template');
    
    const mainControls = document.getElementById('main-controls');
    const mobileSidebarControls = document.getElementById('mobile-sidebar-controls');
    const desktopSidebarOptions = document.getElementById('desktop-sidebar-options');
    
    mainControls.appendChild(selectorsTemplate.content.cloneNode(true));
    mobileSidebarControls.appendChild(selectorsTemplate.content.cloneNode(true));
    mobileSidebarControls.appendChild(optionsTemplate.content.cloneNode(true));
    desktopSidebarOptions.appendChild(optionsTemplate.content.cloneNode(true));

    const allControls = [mainControls, mobileSidebarControls, desktopSidebarOptions];

    allControls.forEach(container => {
        if (container.querySelector('.book-select')) {
            populateBooks(container.querySelector('.book-select'));
            populateChapters(
                container.querySelector('.book-select'),
                container.querySelector('.chapter-select')
            );
        }
    });

    const allBookSelects = document.querySelectorAll('.book-select');
    const allChapterSelects = document.querySelectorAll('.chapter-select');
    const allTranslationSelects = document.querySelectorAll('.translation-select');
    const allCustomVersionInputs = document.querySelectorAll('.custom-version-input');

    function syncVersionControls(sourceElement) {
        const isSelect = sourceElement.tagName === 'SELECT';
        const selectedValue = isSelect ? sourceElement.value : 'custom';
        const customValue = isSelect ? '' : sourceElement.value;

        allControls.forEach(container => {
            const select = container.querySelector('.translation-select');
            const input = container.querySelector('.custom-version-input');
            if (!select || !input) return;

            select.value = selectedValue;
            if(document.activeElement !== input) { input.value = customValue; }
            
            const isMobileView = container.closest('#mobile-sidebar-controls');
            const shouldShowCustomInput = selectedValue === 'custom' && aiFeaturesEnabled;

            if (shouldShowCustomInput) {
                if(isMobileView) {
                    input.classList.remove('hidden');
                } else {
                    select.classList.remove('w-full');
                    select.classList.add('w-2/3');
                    input.classList.remove('hidden');
                    input.classList.add('flex-grow');
                }
            } else {
                select.classList.add('w-full');
                select.classList.remove('w-2/3');
                input.classList.add('hidden');
                input.classList.remove('flex-grow');
            }
        });

        if (selectedValue !== 'custom') {
            applyTranslation(selectedValue);
        }
    }

    allTranslationSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            syncVersionControls(e.target);
        });
    });

    allCustomVersionInputs.forEach(input => {
        input.addEventListener('input', (e) => {
             allCustomVersionInputs.forEach(i => {
                if (i !== e.target) i.value = e.target.value;
             });
        });
    });


    allBookSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const newBook = e.target.value;
            allBookSelects.forEach(s => s.value = newBook);
            allControls.forEach(cont => {
                if (cont.querySelector('.book-select')) {
                    populateChapters(cont.querySelector('.book-select'), cont.querySelector('.chapter-select'));
                }
            });
        });
    });

    allChapterSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const newChapter = e.target.value;
            allChapterSelects.forEach(s => s.value = newChapter);
        });
    });
    
    setupDirectVerseSearch();
    
    document.querySelectorAll('.fetch-button').forEach(btn => btn.addEventListener('click', getScripture));
    document.querySelectorAll('.font-increase').forEach(btn => btn.addEventListener('click', () => changeFontSize(0.125)));
    document.querySelectorAll('.font-decrease').forEach(btn => btn.addEventListener('click', () => changeFontSize(-0.125)));
    document.querySelectorAll('.open-quote-modal-btn').forEach(btn => btn.addEventListener('click', openQuoteModal));
    document.querySelectorAll('.theme-toggle').forEach(btn => btn.addEventListener('click', toggleTheme));
    document.querySelectorAll('.ai-toggle-btn').forEach(btn => btn.addEventListener('click', toggleAiFeatures));
    document.querySelectorAll('.font-family-select').forEach(sel => sel.addEventListener('change', (e) => applyFontFamily(e.target.value)));
    document.querySelectorAll('.reset-app-btn').forEach(btn => btn.addEventListener('click', resetApp));
    document.querySelectorAll('.set-api-key-btn').forEach(btn => btn.addEventListener('click', () => openApiKeyModal(null)));
    
    document.getElementById('open-highlights-modal-btn').addEventListener('click', openHighlightsModal);
    document.querySelectorAll('.open-highlights-modal-btn-mobile').forEach(btn => btn.addEventListener('click', openHighlightsModal));
    
    // Floating menu buttons
    document.getElementById('open-mobile-sidebar-btn-floating').addEventListener('click', () => toggleMobileSidebar(true));
    document.getElementById('search-btn-floating').addEventListener('click', () => searchModal.classList.remove('hidden'));

    // Initial load from localStorage before auth state is known
    loadDataFromLocalStorage();
    
    allBookSelects.forEach(s => s.value = currentBook);
    allControls.forEach(cont => {
        if (cont.querySelector('.book-select')) {
            populateChapters(cont.querySelector('.book-select'), cont.querySelector('.chapter-select'));
            cont.querySelector('.chapter-select').value = currentChapter;
        }
    });
    
    syncVersionControls(document.querySelector('#main-controls .translation-select'));


    openMobileSidebarBtn.addEventListener('click', () => toggleMobileSidebar(true));
    closeMobileSidebarBtn.addEventListener('click', () => toggleMobileSidebar(false));
    mobileSidebarOverlay.addEventListener('click', () => toggleMobileSidebar(false));
    openDesktopOptionsBtn.addEventListener('click', () => toggleDesktopOptions(true));
    closeDesktopOptionsBtn.addEventListener('click', () => toggleDesktopOptions(false));

    closeQuoteModalBtn.addEventListener('click', closeQuoteModal);
    generateAndDownloadBtn.addEventListener('click', generateAndDownloadQuote);
    const quoteTranslationSelect = document.getElementById('translation-select-quote');
    const customVersionContainer = document.getElementById('quote-custom-version-container');
    quoteTranslationSelect.addEventListener('change', () => {
        customVersionContainer.classList.toggle('hidden', quoteTranslationSelect.value !== 'custom');
    });
    
    quoteBookSelect.addEventListener('change', () => populateChapters(quoteBookSelect, quoteChapterSelect));

    closeAiModalBtn.addEventListener('click', closeAiModal);

    searchBtn.addEventListener('click', () => searchModal.classList.remove('hidden'));
    closeSearchModalBtn.addEventListener('click', () => searchModal.classList.add('hidden'));
    
    searchResults.addEventListener('click', async (e) => {
    if (e.target.classList.contains('search-result-verse')) {
        const book = e.target.dataset.book;
        const chapter = e.target.dataset.chapter;
        const verse = e.target.dataset.verse; // Get the specific verse number

        // Update all book and chapter selectors in the UI
        document.querySelectorAll('.book-select').forEach(select => {
            select.value = book;
            const controlsContainer = select.closest('.grid, .space-y-4');
            const chapterSelect = controlsContainer.querySelector('.chapter-select');
            if (chapterSelect) {
                populateChapters(select, chapterSelect);
                chapterSelect.value = chapter;
            }
        });
        
        // Update the global state variables before fetching
        currentBook = book;
        currentChapter = chapter;
        
        searchModal.classList.add('hidden');
        await getScripture(); // Wait for the chapter content to load and render

        // After content is loaded, scroll to and highlight the verse
        setTimeout(() => {
            const verseRef = `${book} ${chapter}:${verse}`;
            const verseElement = document.querySelector(`[data-verse-ref="${verseRef}"]`);
            if (verseElement) {
                verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a temporary highlight for user feedback
                verseElement.style.transition = 'background-color 0.5s ease';
                verseElement.style.backgroundColor = 'rgba(99, 102, 241, 0.4)'; // An indigo highlight
                setTimeout(() => {
                    verseElement.style.backgroundColor = ''; // Remove the highlight
                }, 2500);
            }
        }, 200); // A short delay ensures the DOM has painted
    }
});

    executeSearchBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (!query) return;
        searchResults.innerHTML = loaderHTML;
        const prompt = `Find up to 10 Bible verses related to the topic "${query}". For each verse, provide the book, chapter, verse number, full reference, and the full text. Respond ONLY with a JSON object containing a key "verses" which is an array of objects. Each object in the array should have five keys: "book", "chapter", "verse", "reference", and "text".`;
        try {
            const jsonString = await callGemini(prompt);
            const cleanedJsonString = jsonString.replace(/```json\n?|```/g, '').trim();
            const data = JSON.parse(cleanedJsonString);
            if (data.verses && data.verses.length > 0) {
                let html = '<ul>';
                data.verses.forEach(verse => {
                html += `<li class="mb-4"><button class="search-result-verse text-left font-bold text-indigo-600 dark:text-indigo-400 hover:underline" data-book="${verse.book}" data-chapter="${verse.chapter}" data-verse="${verse.verse}">${verse.reference}</button><p class="italic">${verse.text}</p></li>`;                });
                html += '</ul>';
                searchResults.innerHTML = html;
            } else {
                searchResults.innerHTML = '<p>No verses found for this topic.</p>';
            }
        } catch (error) {
            console.error("Search error:", error);
            searchResults.innerHTML = '<p class="text-red-500">Sorry, an error occurred during the search.</p>';
        }
    });

    // Verse Action Popup Listeners
    document.getElementById('popup-verse-from').addEventListener('input', updateVerseRefDisplay);
    document.getElementById('popup-verse-to').addEventListener('input', updateVerseRefDisplay);
    document.getElementById('copy-verse-btn').addEventListener('click', (e) => {
        const { text, reference } = getVerseRangeText();
        if (text && reference) {
            const fullText = `"${text}" — ${reference} (${currentTranslationName})`;
            navigator.clipboard.writeText(fullText).then(() => {
               showToast('Copied to clipboard!');
            });
        }
    });
    document.getElementById('share-verse-btn').addEventListener('click', (e) => {
        if (navigator.share) {
            const { text, reference } = getVerseRangeText();
             if (text && reference) {
                const fullText = `"${text}" — ${reference} (${currentTranslationName})`;
                navigator.share({
                    title: reference,
                    text: fullText,
                }).catch(console.error);
            }
        } else {
            alert("Sharing is not supported on this browser.");
        }
    });

    document.getElementById('highlight-popup').addEventListener('click', (e) => {
        if (e.target.closest('.color-swatch')) {
            document.querySelectorAll('#highlight-popup .color-swatch').forEach(sw => sw.classList.remove('selected'));
            e.target.closest('.color-swatch').classList.add('selected');
        }
    });
    document.getElementById('save-highlight-btn').addEventListener('click', saveHighlight);
    document.getElementById('remove-highlight-btn').addEventListener('click', removeHighlight);
    document.getElementById('close-highlight-popup').addEventListener('click', hideHighlightPopup);
    document.getElementById('add-category-btn').addEventListener('click', addCategory);

    // WYSIWYG Listeners for Main Popup
    const noteInput = document.getElementById('highlight-note-input');
    const notePreview = document.getElementById('highlight-note-preview');
    noteInput.addEventListener('input', () => { notePreview.innerHTML = marked.parse(noteInput.value); });
    notePreview.addEventListener('click', () => {
        notePreview.classList.add('hidden');
        noteInput.classList.remove('hidden');
        noteInput.focus();
    });
    noteInput.addEventListener('blur', () => {
        if(noteInput.value) {
            noteInput.classList.add('hidden');
            notePreview.classList.remove('hidden');
        }
    });

    // WYSIWYG Event Delegation for Highlights Modal
    highlightsContent.addEventListener('click', e => {
        if (e.target.matches('.note-preview')) {
            const ref = e.target.dataset.previewRef;
            const container = e.target.closest('.note-container');
            const textarea = container.querySelector(`.note-textarea[data-note-ref="${ref}"]`);
            e.target.classList.add('hidden');
            textarea.classList.remove('hidden');
            textarea.focus();
        } else if (e.target.matches('.save-note-btn')) {
             const ref = e.target.dataset.saveRef;
            const container = e.target.closest('.note-container');
            const noteText = container.querySelector(`.note-textarea[data-note-ref="${ref}"]`).value;
            if (highlights[ref]) {
                highlights[ref].note = noteText;
                saveData();
                e.target.textContent = 'Saved!';
                setTimeout(() => { e.target.textContent = 'Save Note'; }, 2000);
                renderHighlights(); // Re-render to update the preview
            }
        }
    });
     highlightsContent.addEventListener('input', e => {
        if (e.target.matches('.note-textarea')) {
            const ref = e.target.dataset.noteRef;
            const container = e.target.closest('.note-container');
            const preview = container.querySelector(`.note-preview[data-preview-ref="${ref}"]`);
            preview.innerHTML = marked.parse(e.target.value);
        }
    });
    highlightsContent.addEventListener('focusout', e => {
         if (e.target.matches('.note-textarea')) {
            if (e.target.value) {
                 const ref = e.target.dataset.noteRef;
                const container = e.target.closest('.note-container');
                const preview = container.querySelector(`.note-preview[data-preview-ref="${ref}"]`);
                e.target.classList.add('hidden');
                preview.classList.remove('hidden');
            }
         }
    });


    document.addEventListener('click', (e) => {
        const popupContainer = document.getElementById('highlight-popup-container');
        if (!popupContainer.contains(e.target) && !e.target.closest('[data-verse-ref]')) {
            hideHighlightPopup();
        }
    });
    
    closeHighlightsModalBtn.addEventListener('click', closeHighlightsModal);
    
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    closeApiKeyModalBtn.addEventListener('click', closeApiKeyModal);

    // --- Auth Event Listeners ---
    const { 
        auth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, 
        createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut 
    } = window.firebase;

    closeLoginModalBtn.addEventListener('click', () => loginModal.classList.add('hidden'));

    googleLoginBtn.addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .catch((error) => {
                console.error("Google Sign-In Error", error);
                showAuthError(error.message);
            });
    });

    emailLoginBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        if (!email || !password) {
            showAuthError("Please enter both email and password.");
            return;
        }
        signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                console.error("Email Login Error", error);
                showAuthError(error.message);
            });
    });

    emailSignupBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
         if (!email || !password) {
            showAuthError("Please enter both email and password.");
            return;
        }
        createUserWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                console.error("Email Sign-Up Error", error);
                showAuthError(error.message);
            });
    });
    
    onAuthStateChanged(auth, (user) => {
        updateAuthUI(user);
    });
});