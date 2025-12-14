"use client"


import { motion } from "framer-motion"

export default function References() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">


            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-16 md:py-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto text-center space-y-4"
                        >
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                                References & <span className="text-primary">FAQ</span>
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Access project documentation, standards, and answers to common questions.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* References Section */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-bold mb-8 text-center">Reference Documents</h2>
                        <motion.div
                            variants={container}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
                        >
                            {[
                                { title: "BS ISO-IEC 25010-2011.pdf", desc: "System and software quality models", icon: "path" },
                                { title: "BS ISO-IEC 25023-2016.pdf", desc: "Measurement of system and software product quality", icon: "path" },
                                { title: "Software Quality Measurement Simulation Tool.pdf", desc: "Documentation for the simulation tool", icon: "path" },
                                { title: "ISO 15939 Presentation", url: "iso-15939-presentation-en.html", desc: "Presentation slides on ISO 15939 standard", icon: "path" },
                                { title: "Tool Screenshots", url: "iso-tool-screenshots (2).html", desc: "Visual reference for the tool's interface", icon: "image" }
                            ].map((doc, idx) => (
                                <motion.a
                                    key={idx}
                                    variants={item}
                                    href={doc.url ? `reference_documents/${doc.url}` : `reference_documents/${doc.title}`}
                                    target="_blank"
                                    className="group bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all hover:border-primary/50"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                        </div>
                                        <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{doc.title}</h3>
                                    <p className="text-sm text-muted-foreground">{doc.desc}</p>
                                </motion.a>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 bg-accent/50">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: "What is ISO 15939?", a: "ISO/IEC 15939 is an international standard that defines a measurement process applicable to system and software engineering and management disciplines." },
                                { q: "How do I use the Quality Assessment Simulator?", a: "Navigate to the 'Simulator' page and follow the 4-step process: Select a case study, assign weights, input values, and view results." },
                                { q: "Can I create my own measurement scenario?", a: "Yes, in the Simulator, select 'Custom Scenario' to choose specific quality dimensions relevant to your project." },
                                { q: "What do the charts show?", a: "The radar chart visualizes the performance of different quality dimensions against their targets." },
                                { q: "How are the scores calculated?", a: "Scores are calculated based on the weighted average of the input values for each dimension." }
                            ].map((faq, idx) => (
                                <div key={idx} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                                    <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                                    <p className="text-muted-foreground">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
                    <p>&copy; 2024 Software Quality Assessment Tool</p>
                </footer>
            </main>
        </div>
    )
}
