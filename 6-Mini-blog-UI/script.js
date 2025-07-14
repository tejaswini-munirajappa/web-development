document.addEventListener('DOMContentLoaded', () => {
    const welcomeBox = document.getElementById('welcome-box');
    const appContent = document.getElementById('app-content');
    const welcomeForm = document.getElementById('welcomeForm');
    const usernameInput = document.getElementById('username');

    welcomeBox.classList.remove('hidden');
    usernameInput.focus();

    welcomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            localStorage.setItem('blogsyUsername', username);
            welcomeBox.style.display = 'none';
            appContent.classList.remove('hidden');
        } else {
            showMessageBox('Please enter a username!', 'error');
        }
    });

    const blogPostForm = document.getElementById('blogPostForm');
    const postTitleInput = document.getElementById('postTitle');
    const postContentInput = document.getElementById('postContent');
    const postsDisplayArea = document.getElementById('postsDisplayArea');

    let posts = [];

    function renderPosts() {
        postsDisplayArea.innerHTML = '';

        if (posts.length === 0) {
            postsDisplayArea.innerHTML = '<p class="no-posts-message" style="text-align: center; color: #666; font-style: italic;">No posts yet! Be the first to share your thoughts.</p>';
            return;
        }

        [...posts].reverse().forEach((post, displayIndex) => {
            const postCard = document.createElement('div');
            postCard.classList.add('blog-post-card');

            const originalIndex = posts.findIndex(p => p.date === post.date && p.title === post.title);

            postCard.innerHTML = `
                <h3>${post.title}</h3>
                <p class="post-meta">Posted on ${new Date(post.date).toLocaleDateString()}</p>
                <p>${post.content}</p>
                <button class="delete-btn" data-original-index="${originalIndex}">Delete</button>
            `;
            postsDisplayArea.appendChild(postCard);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                showConfirmModal('Are you sure you want to delete this post?', () => {
                    const originalIndexToDelete = parseInt(e.target.dataset.originalIndex);
                    deletePost(originalIndexToDelete);
                });
            });
        });
    }

    function loadPosts() {
        const storedPosts = localStorage.getItem('miniBlogPosts');
        if (storedPosts) {
            posts = JSON.parse(storedPosts);
            renderPosts();
        }
    }

    function savePosts() {
        localStorage.setItem('miniBlogPosts', JSON.stringify(posts));
    }

    blogPostForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = postTitleInput.value.trim();
        const content = postContentInput.value.trim();

        if (title && content) {
            const newPost = {
                title: title,
                content: content,
                date: new Date().toISOString()
            };

            posts.push(newPost);
            savePosts();
            renderPosts();

            postTitleInput.value = '';
            postContentInput.value = '';
        } else {
            showMessageBox('Please fill in all fields!', 'error');
        }
    });

    function deletePost(index) {
        if (index >= 0 && index < posts.length) {
            posts.splice(index, 1);
            savePosts();
            renderPosts();
            showMessageBox('Post deleted successfully!', 'success');
        } else {
            showMessageBox('Error: Post not found.', 'error');
        }
    }

    function showMessageBox(message, type = 'info') {
        let messageBox = document.getElementById('messageBox');
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.id = 'messageBox';
            document.body.appendChild(messageBox);
        }
        messageBox.className = `message-box ${type}`;
        messageBox.textContent = message;
        messageBox.style.display = 'block';
        messageBox.style.opacity = '1';

        setTimeout(() => {
            messageBox.style.opacity = '0';
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 500);
        }, 3000);
    }

    function showConfirmModal(message, onConfirm) {
        let confirmModal = document.getElementById('confirmModal');
        let confirmOverlay = document.getElementById('confirmOverlay');

        if (!confirmModal) {
            confirmOverlay = document.createElement('div');
            confirmOverlay.id = 'confirmOverlay';
            confirmOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); z-index: 1001; display: flex;
                justify-content: center; align-items: center;
            `;
            document.body.appendChild(confirmOverlay);

            confirmModal = document.createElement('div');
            confirmModal.id = 'confirmModal';
            confirmModal.style.cssText = `
                background: white; padding: 30px; border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2); text-align: center;
                max-width: 400px; width: 90%;
            `;
            confirmOverlay.appendChild(confirmModal);
        }

        confirmModal.innerHTML = `
            <p style="font-size: 1.1em; margin-bottom: 25px;">${message}</p>
            <button id="confirmYes" style="background-color: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Yes</button>
            <button id="confirmNo" style="background-color: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">No</button>
        `;

        confirmOverlay.style.display = 'flex';

        document.getElementById('confirmYes').onclick = () => {
            onConfirm();
            confirmOverlay.style.display = 'none';
        };

        document.getElementById('confirmNo').onclick = () => {
            confirmOverlay.style.display = 'none';
        };
    }

    loadPosts();
});
