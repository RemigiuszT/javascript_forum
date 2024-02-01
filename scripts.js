let globalPosts = [];
let globalComments = [];
let currentIndex = 0;
const postsPerPage = 10;

document.addEventListener("DOMContentLoaded", function () {
  fetchPostsAndComments();
  window.addEventListener("hashchange", route);
  route();
  window.addEventListener("scroll", handleScroll);
});

function fetchPostsAndComments() {
  Promise.all([
    fetch("https://jsonplaceholder.typicode.com/posts").then((response) =>
      response.json()
    ),
    fetch("https://jsonplaceholder.typicode.com/comments").then((response) =>
      response.json()
    ),
  ])
    .then(([posts, comments]) => {
      globalPosts = posts;
      globalComments = comments;
      route();
    })
    .catch((error) => {
      console.error("Error fetching data", error);
    });
}

function route() {
  const hash = window.location.hash;
  const app = document.getElementById("app");
  app.innerHTML = "";

  if (!hash || hash === "#/") {
    currentIndex = 0;
    displayPosts();
    window.addEventListener("scroll", handleScroll);
  } else if (hash.startsWith("#/post/")) {
    const postId = hash.split("#/post/")[1];
    displayPostDetails(postId);
    window.removeEventListener("scroll", handleScroll);
  }
}

function displayPosts() {
  if (window.location.hash !== "#/") return;

  const app = document.getElementById("app");
  const postsToShow = globalPosts.slice(
    currentIndex,
    currentIndex + postsPerPage
  );

  postsToShow.forEach((post) => {
    if (!document.getElementById(`post-${post.id}`)) {
      app.appendChild(createPostElement(post));
    }
  });

  currentIndex += postsToShow.length;
}

function handleScroll() {
  if (window.location.hash === "#/" && isBottomOfPage()) {
    displayPosts();
  }
}

function isBottomOfPage() {
  return (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
  );
}

window.addEventListener("scroll", function () {
  if (isBottomOfPage()) {
    displayPosts();
  }
});

function displayPostDetails(postId) {
  const post = globalPosts.find((p) => p.id.toString() === postId);
  if (!post) return;

  const postComments = globalComments.filter(
    (c) => c.postId.toString() === postId
  );
  if (postComments.length === 0) {
    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
      .then((response) => response.json())
      .then((comments) => {
        globalComments = globalComments.concat(comments);
        showPostDetails(post, comments);
      })
      .catch((error) => console.error("Error fetching comments:", error));
  } else {
    showPostDetails(post, postComments);
  }
}

function createPostElement(post) {
  const postCard = document.createElement("div");
  postCard.className = "post-card";
  postCard.id = `post-${post.id}`;
  postCard.innerHTML = `
    <div class="user-info">
      <div class="avatar"></div>
      <span>User ${post.userId}</span>
    </div>
    <h3>${post.title}</h3>
    <p>${post.body}</p>
  `;
  postCard.onclick = function () {
    window.location.hash = `#/post/${post.id}`;
  };
  return postCard;
}

function createPostDetailElement(post, comments) {
  const postDetail = document.createElement("div");
  postDetail.className = "post-detail";

  const avatar = document.createElement("div");
  avatar.className = "avatar";

  const userId = document.createElement("span");
  userId.textContent = `User ${post.userId}`;
  userId.style.fontWeight = "bold";
  userId.style.marginLeft = "4px";

  const title = document.createElement("h2");
  title.textContent = post.title;

  const body = document.createElement("p");
  body.textContent = post.body;

  const userInfo = document.createElement("div");
  userInfo.className = "user-info";
  userInfo.appendChild(avatar);
  userInfo.appendChild(userId);

  postDetail.appendChild(userInfo);
  postDetail.appendChild(title);
  postDetail.appendChild(body);

  const commentList = document.createElement("div");
  commentList.className = "comment-list";
  comments.forEach((comment) => {
    commentList.appendChild(createCommentElement(comment));
  });

  postDetail.appendChild(commentList);
  return postDetail;
}

function createCommentElement(comment) {
  const commentDiv = document.createElement("div");
  commentDiv.className = "comment";

  const avatarAndEmailDiv = document.createElement("div");
  avatarAndEmailDiv.className = "avatar-and-email";
  avatarAndEmailDiv.style.display = "flex";
  avatarAndEmailDiv.style.alignItems = "center";

  const avatar = createAvatarElement(comment.email);
  avatar.style.backgroundImage = `url(https://i.pravatar.cc/150?u=${comment.email})`;

  const commenterEmail = document.createElement("p");
  commenterEmail.textContent = comment.email;
  commenterEmail.className = "commenter-email";
  commenterEmail.style.marginLeft = "10px";

  avatarAndEmailDiv.appendChild(avatar);
  avatarAndEmailDiv.appendChild(commenterEmail);

  const commenterName = document.createElement("h3");
  commenterName.textContent = comment.name;

  const commentBody = document.createElement("p");
  commentBody.textContent = comment.body;

  commentDiv.appendChild(avatarAndEmailDiv);
  commentDiv.appendChild(commenterName);
  commentDiv.appendChild(commentBody);

  return commentDiv;
}

function createAvatarElement(email) {
  const avatarDiv = document.createElement("div");
  avatarDiv.className = "avatar";
  avatarDiv.style.backgroundImage = `url(https://i.pravatar.cc/150?u=${email})`;
  return avatarDiv;
}

function createBackButton() {
  const backButton = document.createElement("button");
  backButton.textContent = "Back";
  backButton.onclick = function () {
    window.location.hash = "#/";
  };
  return backButton;
}

function showPostDetails(post, comments) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const backButton = createBackButton();
  app.appendChild(backButton);
  const postElement = createPostDetailElement(post, comments);
  app.appendChild(postElement);
}
