import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { getDatabase, ref, push, set, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const firebaseConfig = {
	apiKey: "AIzaSyC1f6z7Y17BhNMU5_NHwpH9HtpImb9-Ozw",
	authDomain: "wonyong--todo-backend.firebaseapp.com",
	projectId: "wonyong--todo-backend",
	storageBucket: "wonyong--todo-backend.firebasestorage.app",
	messagingSenderId: "778504554755",
	appId: "1:778504554755:web:8acd7102c29f9452018136",
	measurementId: "G-6D0XXBDQNW",
	databaseURL: "https://wonyong--todo-backend-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

(function () {
	const STORAGE_KEY = 'todos:v1';

	/** @type {{ id:number, text:string }[]} */
	let todos = [];

	const $input = document.getElementById('todoText');
	const $addBtn = document.getElementById('addBtn');
	const $list = document.getElementById('todoList');

	function load() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			todos = raw ? JSON.parse(raw) : [];
		} catch (e) {
			todos = [];
		}
	}

	function subscribeFirebase() {
		const listRef = ref(db, 'todos');
		onValue(listRef, (snapshot) => {
			const next = [];
			snapshot.forEach(child => {
				const val = child.val() || {};
				next.push({ id: child.key, text: val.text || '' , createdAt: val.createdAt || 0 });
			});
			next.sort((a, b) => b.createdAt - a.createdAt);
			todos = next.map(({ id, text }) => ({ id, text }));
			save();
			render();
		});
	}

	function save() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
	}

	function createTodo(text) {
		return { id: Date.now(), text };
	}

	async function addTodo() {
		const text = ($input.value || '').trim();
		if (!text) return;

		try {
			const listRef = ref(db, 'todos');
			const newRef = push(listRef);
			await set(newRef, { text, createdAt: Date.now() });
			// UI 업데이트는 onValue 구독에서 처리
		} catch (e) {
			alert('추가 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
			return;
		} finally {
			$input.value = '';
			$input.focus();
		}
	}

async function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const next = prompt('할 일을 수정하세요', todo.text);
    if (next === null) return; // cancel
    const text = next.trim();
    if (!text) return;

    try {
        await update(ref(db, `todos/${id}`), { text });
        // onValue가 알아서 최신 상태를 반영합니다
    } catch (e) {
        alert('수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
}

async function deleteTodo(id) {
    const ok = confirm('정말 삭제하시겠어요?');
    if (!ok) return;
    try {
        await remove(ref(db, `todos/${id}`));
        // onValue가 알아서 최신 상태를 반영합니다
    } catch (e) {
        alert('삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
}

	function render() {
		$list.innerHTML = '';
		if (todos.length === 0) {
			const empty = document.createElement('li');
			empty.className = 'empty';
			empty.textContent = '아직 추가된 할 일이 없어요';
			$list.appendChild(empty);
			return;
		}

		for (const item of todos) {
			const li = document.createElement('li');
			li.className = 'todo-item';

			const bullet = document.createElement('span');
			bullet.textContent = '•';
			bullet.style.opacity = '.5';

			const text = document.createElement('div');
			text.className = 'text';
			text.textContent = item.text;

			const actions = document.createElement('div');
			actions.className = 'todo-actions';

			const editBtn = document.createElement('button');
			editBtn.className = 'btn-ghost';
			editBtn.textContent = '수정';
			editBtn.addEventListener('click', () => editTodo(item.id));

			const delBtn = document.createElement('button');
			delBtn.className = 'btn-ghost';
			delBtn.textContent = '삭제';
			delBtn.addEventListener('click', () => deleteTodo(item.id));

			actions.appendChild(editBtn);
			actions.appendChild(delBtn);

			li.appendChild(bullet);
			li.appendChild(text);
			li.appendChild(actions);
			$list.appendChild(li);
		}
	}

	// 이벤트 바인딩
	$addBtn.addEventListener('click', addTodo);
	$input.addEventListener('keydown', function (e) {
		if (e.key === 'Enter') addTodo();
	});

	// 초기화: 로컬 캐시 표시 후 Firebase 실시간 반영
	load();
	render();
	subscribeFirebase();
})();


