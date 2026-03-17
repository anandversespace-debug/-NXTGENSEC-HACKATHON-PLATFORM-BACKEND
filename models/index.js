// This file serves as the "Model" layer hub
// In a real app, these would be Sequelize/Mongoose instances.

const projects = [
  {
    id: '1',
    title: 'CyberGuard AI',
    description: 'Autonomous threat detection using neural networks.',
    tech_stack: ['Next.js', 'Rust', 'TensorFlow'],
    github_url: 'https://github.com',
    demo_url: 'https://demo.com',
    created_at: new Date()
  }
];

const hackathons = [
  {
    id: 'h1',
    title: 'CyberShield Global 2024',
    description: 'The flagship event of the NxtGenSec Development Division. $10,000 prize pool, 500+ participants.',
    start_date: '2024-04-15',
    end_date: '2024-04-17',
    registration_link: '/hackathons/register'
  }
];

const blogs = [
  {
    id: 'b1',
    title: 'Modern Secure Development Practices',
    content: 'Long content here...',
    excerpt: 'Key practices for building secure modern apps.',
    category: 'Security',
    author_id: 'u1',
    author_name: 'Alex Chen',
    created_at: new Date('2024-03-10'),
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800&h=450'
  }
];

const users = [
  {
    id: 'u1',
    name: 'Alex Chen',
    username: 'cipher',
    email: 'alex@nxtgensec.com',
    skills: ['Rust', 'Solidity', 'Security Audit'],
    role: 'developer',
    github: 'https://github.com/alexchen',
    contributions: 4800,
    created_at: new Date('2023-11-20')
  }
];

module.exports = {
  projects,
  hackathons,
  blogs,
  users
};
