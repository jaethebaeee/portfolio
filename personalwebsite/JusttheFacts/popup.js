// Array of verified news stories about Jae
const facts = [
  {
    title: "💼 Current Role",
    content: "Software Engineer specializing in full-stack development"
  },
  {
    title: "🎓 Education",
    content: "Computer Science graduate from Cornell University"
  },
  {
    title: "🛠️ Tech Stack",
    content: "React, TypeScript, Node.js, Three.js, Python"
  },
  {
    title: "🎮 Projects",
    content: "Built interactive 3D portfolio with voxel graphics"
  },
  {
    title: "🌟 Skills",
    content: "Full-stack development, 3D graphics, UI/UX design"
  },
  {
    title: "🎯 Focus",
    content: "Creating immersive web experiences and games"
  },
  {
    title: "📚 Learning",
    content: "Always exploring new technologies and frameworks"
  },
  {
    title: "🏗️ Architecture",
    content: "Experience with microservices and scalable systems"
  }
];

function getRandomFact() {
  return facts[Math.floor(Math.random() * facts.length)];
}

function updateFactDisplay() {
  const factContainer = document.getElementById('fact-container');
  const randomFact = getRandomFact();

  factContainer.innerHTML = `
    <div class="fact-card">
      <div class="fact-title">${randomFact.title}</div>
      <div class="fact-content">${randomFact.content}</div>
    </div>
  `;
}

// Add click event listener to refresh button
document.getElementById('refresh-btn').addEventListener('click', updateFactDisplay);

// Initialize with a random fact on popup open
document.addEventListener('DOMContentLoaded', updateFactDisplay);
