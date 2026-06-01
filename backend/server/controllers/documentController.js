import Document from "../models/Document.js";

export const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createDocument = async (req, res) => {
    try {
        const { title, summary, actionItems, decisionPoints, sentiment } = req.body;
        const document = await Document.create({
            title,
            summary,
            actionItems: actionItems || [],
            decisionPoints: decisionPoints || [],
            sentiment: sentiment || "Neutral",
            createdBy: req.user._id,
        });
        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        if (document.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await document.deleteOne();
        res.json({ message: "Document removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
