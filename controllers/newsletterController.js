const User = require('../models/User');
const Blog = require('../models/Blog');
const Hackathon = require('../models/Hackathon');
const Project = require('../models/Project');
const { sendEmail } = require('../config/nodemailer');

/**
 * @desc    Send weekly/monthly newsletter to subscribed users
 * @route   POST /api/newsletter/send
 * @access  Private (Admin Only)
 */
exports.sendManualNewsletter = async (req, res) => {
  try {
    const subscribers = await User.find({ newsletterSubscribed: true }).select('email name');
    
    if (!subscribers.length) {
      return res.status(404).json({ message: 'No active subscribers found.' });
    }

    // Fetch new content from last 7 days
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [newBlogs, newHackathons, topProjects] = await Promise.all([
      Blog.find({ createdAt: { $gte: lastWeek } }).limit(3).populate('author', 'name username'),
      Hackathon.find({ createdAt: { $gte: lastWeek } }).limit(2),
      Project.find({ status: 'verified' }).sort({ 'contributions': -1 }).limit(3).populate('created_by', 'name username'),
    ]);

    if (!newBlogs.length && !newHackathons.length && !topProjects.length) {
      return res.status(400).json({ message: 'No new intelligence nodes to broadcast.' });
    }

    const htmlContent = generateNewsletterHTML(newBlogs, newHackathons, topProjects);

    // Send emails (batching)
    const emailPromises = subscribers.map(sub => 
      sendEmail(sub.email, 'Weekly Intellectual Broadcast \ NxtGenSec', htmlContent.replace('{{USER_NAME}}', sub.name))
    );

    await Promise.all(emailPromises);

    res.json({ 
      message: `Broadcast complete. Sent to ${subscribers.length} nodes.`,
      stats: {
        blogs: newBlogs.length,
        hackathons: newHackathons.length,
        projects: topProjects.length
      }
    });
  } catch (err) {
    console.error('[ERR] Newsletter failed:', err);
    res.status(500).json({ message: 'Internal broadcast error.' });
  }
};

/**
 * Generate a high-fidelity HTML template for the newsletter
 */
function generateNewsletterHTML(blogs, hackathons, projects) {
  const blogList = blogs.map(b => `
    <div style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
      <h3 style="margin: 0; color: #3b82f6;">${b.title}</h3>
      <p style="font-size: 12px; color: #666;">By @${b.author?.username || 'unknown'}</p>
      <p style="font-size: 14px; line-height: 1.6;">${b.content.slice(0, 150)}...</p>
      <a href="${process.env.FRONTEND_URL}/blog" style="color: #3b82f6; font-weight: bold; text-decoration: none; font-size: 12px;">READ FULL DISPATCH &rarr;</a>
    </div>
  `).join('');

  const hackathonList = hackathons.map(h => `
    <div style="margin-bottom: 15px; border-left: 4px solid #f59e0b; padding-left: 15px;">
      <h4 style="margin: 0; text-transform: uppercase; letter-spacing: 1px;">${h.title}</h4>
      <p style="font-size: 12px; margin: 5px 0;">Starts: ${new Date(h.start_date).toLocaleDateString()}</p>
      <p style="font-size: 13px; color: #555;">${h.description.slice(0, 100)}...</p>
    </div>
  `).join('');

  const projectList = projects.map(p => `
    <div style="display: inline-block; width: 45%; margin: 2%; vertical-align: top; border: 1px solid #eee; border-radius: 12px; padding: 10px;">
      <div style="height: 100px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🚀</div>
      <h5 style="margin: 10px 0 5px; color: #111;">${p.title}</h5>
      <p style="font-size: 10px; color: #999; margin: 0;">Verified Innovation &bull; @${p.created_by?.username}</p>
    </div>
  `).join('');

  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #111; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
      <div style="background: #050505; color: white; padding: 40px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">NxtGenSec <span style="color: #3b82f6;">Ecosystem</span></h1>
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 4px; margin-top: 10px; opacity: 0.5;">Intelligence Update Node</p>
      </div>
      
      <div style="padding: 40px;">
        <p style="font-size: 16px;">Hello <strong>{{USER_NAME}}</strong>,</p>
        <p style="font-size: 14px; color: #555; leading-relaxed;">The platform has synchronized new intelligence nodes. Here's your weekly digest of innovations, challenges, and technical dispatches.</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;" />
        
        <h2 style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #3b82f6; margin-bottom: 30px;">📡 New Dispatches</h2>
        ${blogList || '<p style="font-size: 12px; color: #999;">No new dispatches this cycle.</p>'}
        
        <div style="background: #fff8f1; border-radius: 16px; padding: 30px; margin: 40px 0;">
          <h2 style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #f59e0b; margin-top: 0; margin-bottom: 25px;">🏆 Active Sprint Challenges</h2>
          ${hackathonList || '<p style="font-size: 12px; color: #999;">No new sprints detected.</p>'}
        </div>
        
        <h2 style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #111; margin-bottom: 30px;">💡 Recommended Innovations</h2>
        <div style="text-align: center;">
          ${projectList || '<p style="font-size: 12px; color: #999;">Searching for next-gen nodes...</p>'}
        </div>
        
        <div style="margin-top: 80px; text-align: center; border-top: 1px solid #eee; pt: 40px;">
          <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">Verified Node @ NxtGenSec Security Layer</p>
          <p style="font-size: 9px; color: #ccc;">You received this because you are subscribed to the platform newsletter. <a href="${process.env.FRONTEND_URL}/dashboard/settings" style="color: #3b82f6;">Manage Terminal Preferences</a></p>
        </div>
      </div>
    </div>
  `;
}
