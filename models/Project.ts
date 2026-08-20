import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
    projectName: string;
    clientId: mongoose.Types.ObjectId;
    serviceType?: string;
    projectAmount: number;
    startDate?: Date;
    deadline?: Date;
    status: 'Pending' | 'In Progress' | 'Review' | 'Completed';
    liveUrl?: string;
    githubUrl?: string;
    hostingProvider?: string;
    domainRegisteredEmail?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        projectName: { type: String, required: true, trim: true },
        clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
        serviceType: { type: String, trim: true, default: 'Web Design & Development' },
        projectAmount: { type: Number, required: true, min: 0, default: 0 },
        startDate: { type: Date, default: Date.now },
        deadline: { type: Date },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Review', 'Completed'],
            default: 'Pending',
        },
        liveUrl: { type: String, trim: true },
        githubUrl: { type: String, trim: true },
        hostingProvider: { type: String, trim: true },
        domainRegisteredEmail: { type: String, trim: true },
        notes: { type: String },
    },
    { timestamps: true }
);

const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
