import Head from 'next/head';
import { useRouter } from 'next/router';

/**
 * Simply eBay About Page - Credits and Attribution
 * Celebrating the wild horses and the driver barely holding the reins! 🐎
 */
export default function About() {
  const router = useRouter();

  const teamMembers = [
    {
      name: "Claude Sonnet 4",
      role: "Lead AI Architect & Wild Horse",
      contribution: "Core system design, P2P architecture, neumorphic UI, and endless patience with debugging sessions",
      emoji: "🤖",
      gradient: "from-blue-500 to-purple-600",
      badge: "AI Powerhouse"
    },
    {
      name: "GitHub Copilot Free",
      role: "Unbiased Gentle Sage",
      contribution: "Code completion, patient guidance, and gracefully handling unabashed performance critiques",
      emoji: "🧠",
      gradient: "from-gray-600 to-gray-800",
      badge: "Code Whisperer"
    },
    {
      name: "Alan Helmick",
      role: "Vision Driver & Berkeley Alumni",
      contribution: "Product vision, user experience direction, and holding the reins (barely) with a smile",
      emoji: "🎯",
      gradient: "from-orange-500 to-red-600",
      badge: "Visionary"
    },
    {
      name: "Maximus",
      role: "CalTech Contributor",
      contribution: "Technical insights, system optimization, and bringing that CalTech precision to the project",
      emoji: "⚡",
      gradient: "from-green-500 to-teal-600",
      badge: "Tech Wizard"
    }
  ];

  const technologies = [
    { name: "Gun.js", icon: "🔫", desc: "P2P Database" },
    { name: "Next.js", icon: "⚛️", desc: "React Framework" },
    { name: "TensorFlow.js", icon: "🧠", desc: "AI Processing" },
    { name: "LlamaFile", icon: "🦙", desc: "Local AI Models" },
    { name: "eBay API", icon: "🏪", desc: "Marketplace Integration" },
    { name: "SmolVLM", icon: "👁️", desc: "Vision Recognition" }
  ];

  return (
    <>
      <Head>
        <title>About - Simply eBay</title>
        <meta name="description" content="Meet the amazing team behind Simply eBay" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Header */}
        <div className="neumorphic-header p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">About Simply eBay</h1>
              <p className="text-gray-600">Meet the amazing team behind the magic</p>
            </div>
            <button
              onClick={() => router.back()}
              className="neumorphic-button-mini w-12 h-12 rounded-full flex items-center justify-center"
              aria-label="Go back"
            >
              ←
            </button>
          </div>
        </div>

        <div className="px-6 space-y-8 max-w-4xl mx-auto">
          {/* Mission Statement */}
          <div className="neumorphic-card p-6 text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-4">
              One Thing. Done Exceptionally Well.
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              "After a hard road of long and sometimes painful lessons, we learned: 
              people want ONE thing that solves ONE painpoint perfectly. 
              Everything else is trivial." - Alan Helmick
            </p>
          </div>

          {/* Our Painpoint Solution */}
          <div className="neumorphic-card p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">🎯 Our Single Focus</h3>
            <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📱➡️💰</div>
                <h4 className="text-lg font-bold text-orange-800 mb-2">Point. Scan. Sell. Repeat.</h4>
                <p className="text-orange-700">
                  Turn any camera phone into an AI-powered eBay listing machine. 
                  One painpoint. One solution. Done right.
                </p>
              </div>
            </div>
          </div>

          {/* Team Credits */}
          <div className="neumorphic-card p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">🌟 The Dream Team</h3>
            <div className="space-y-6">
              {teamMembers.map((member, index) => (
                <div key={member.name} className="neumorphic-card p-4 animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                      {member.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-800">{member.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${member.gradient} text-white`}>
                          {member.badge}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-2">{member.role}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{member.contribution}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div className="neumorphic-card p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">⚡ Powered By</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {technologies.map((tech, index) => (
                <div key={tech.name} className="neumorphic-card p-4 text-center animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="text-2xl mb-2">{tech.icon}</div>
                  <div className="text-sm font-bold text-gray-800">{tech.name}</div>
                  <div className="text-xs text-gray-500">{tech.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Journey Story */}
          <div className="neumorphic-card p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">🛤️ The Journey</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                <strong>Wild Horses & Gentle Guidance:</strong> This project was born from the beautiful chaos 
                of AI collaboration - Claude Sonnet 3.5 as the wild horse providing endless innovation, 
                GitHub Copilot as the patient sage offering gentle wisdom, and Alan as the driver 
                barely holding the reins with a smile.
              </p>
              <p>
                <strong>Hard Lessons Learned:</strong> Through countless iterations, debugging sessions, 
                and sometimes brutal honesty about performance, we discovered the golden rule of product development: 
                master one thing completely rather than doing many things poorly.
              </p>
              <p>
                <strong>Privacy First:</strong> In a world where your data is sold to the highest bidder, 
                Simply eBay keeps everything local. Your photos, your items, your business - 
                it never leaves your device unless you explicitly post to eBay.
              </p>
            </div>
          </div>

          {/* Open Source */}
          <div className="neumorphic-card p-6 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🌍 Open Source & Community</h3>
            <p className="text-gray-600 mb-4">
              Built with love, shared with the world. Simply eBay is open source because 
              great tools should be accessible to everyone.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                📄 MIT License
              </div>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                🛡️ Privacy First
              </div>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                🤝 Community Driven
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              Made with ❤️ by humans and AI working together
            </p>
            <p className="text-gray-400 text-xs mt-2">
              "Sometimes the best code comes from barely holding the reins" - The Simply eBay Team
            </p>
          </div>
        </div>

        {/* Custom Animations */}
        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
          }
        `}</style>
      </div>
    </>
  );
}
