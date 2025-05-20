interface ProjectData {
    tweetsCount: number;
    usersCount: number;
    hashtagsCount: number;
}

interface Props {
    projectData: ProjectData | null;
}

export function ProjectStatsContainer({ projectData }: Props) {
    if (!projectData) {
        return <div>Loading project stats...</div>;
    }

    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-w">
            <h1 className="text-2xl font-bold mb-6 border-b border-gray-600 pb-2 text-white">
                Project Statistics
            </h1>
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#3D3D4E] p-4 rounded-lg">
                        <span className="text-gray-400">Tweets</span>
                        <div className="text-3xl font-bold">{projectData.tweetsCount}</div>
                    </div>

                    <div className="bg-[#3D3D4E] p-4 rounded-lg">
                        <span className="text-gray-400">Users</span>
                        <div className="text-3xl font-bold">{projectData.usersCount}</div>
                    </div>

                    <div className="bg-[#3D3D4E] p-4 rounded-lg">
                        <span className="text-gray-400">Hashtags</span>
                        <div className="text-3xl font-bold">{projectData.hashtagsCount}</div>
                    </div>

                </div>
            </div>
        </div>
    );
}