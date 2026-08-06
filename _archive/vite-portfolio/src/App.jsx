import Navbar from './sections/Navbar'
import Hero from './sections/Hero'
import About from './sections/About'
import Skills from './sections/Skills'
import Projects from './sections/Projects'
import Blog from './sections/Blog'
import LearningPhilosophy from './sections/LearningPhilosophy'
import Resume from './sections/Resume'
import Contact from './sections/Contact'

/**
 * Main App component - integrates all sections
 * Smooth scrolling enabled via CSS, fully responsive layout
 */
function App() {
    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <Navbar />

            {/* Main Content */}
            <main>
                <Hero />
                <About />
                <Skills />
                <Projects />
                <Blog />
                <LearningPhilosophy />
                <Resume />
                <Contact />
            </main>
        </div>
    )
}

export default App
