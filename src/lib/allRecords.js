// combine records from one character[] and profile records
export default function CombineAllRecords(profile) {
    const characterRecords = Object.values(profile?.Response?.characterRecords?.data)[0]?.records;
    const profileRecords = profile?.Response?.profileRecords?.data?.records;
    return Object.assign({}, profileRecords, characterRecords);
}