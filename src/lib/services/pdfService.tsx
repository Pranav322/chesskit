import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { GameInsights } from '@/types/insights';
import { InsightSection } from '@/components/GameInsights/SectionSelectionDialog';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});

interface InsightsPDFProps {
  insights: GameInsights;
  selectedSections: InsightSection[];
}

const InsightsPDF = ({ insights, selectedSections }: InsightsPDFProps) => {
  const isSectionEnabled = (sectionId: string) => {
    return selectedSections.find(section => section.id === sectionId)?.checked || false;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Chess Game Insights</Text>
          <Text style={styles.text}>Generated on: {insights.generatedAt.toLocaleDateString()}</Text>
          <Text style={styles.text}>Total Games: {insights.totalGames}</Text>

          {/* Win/Loss Stats */}
          {isSectionEnabled('performance') && (
            <>
              <Text style={styles.subtitle}>Performance</Text>
              <View style={styles.statsContainer}>
                <View>
                  <Text style={styles.text}>As White:</Text>
                  <Text style={styles.text}>Wins: {insights.winLossRatio.white.wins}</Text>
                  <Text style={styles.text}>Losses: {insights.winLossRatio.white.losses}</Text>
                  <Text style={styles.text}>Draws: {insights.winLossRatio.white.draws}</Text>
                  <Text style={styles.text}>Win Rate: {Math.round(insights.winLossRatio.white.winRate)}%</Text>
                </View>
                <View>
                  <Text style={styles.text}>As Black:</Text>
                  <Text style={styles.text}>Wins: {insights.winLossRatio.black.wins}</Text>
                  <Text style={styles.text}>Losses: {insights.winLossRatio.black.losses}</Text>
                  <Text style={styles.text}>Draws: {insights.winLossRatio.black.draws}</Text>
                  <Text style={styles.text}>Win Rate: {Math.round(insights.winLossRatio.black.winRate)}%</Text>
                </View>
              </View>
            </>
          )}

          {/* Time Controls */}
          {isSectionEnabled('timeControls') && (
            <>
              <Text style={styles.subtitle}>Time Controls</Text>
              <View style={styles.statsContainer}>
                <Text style={styles.text}>Bullet: {insights.timeControls.bullet}</Text>
                <Text style={styles.text}>Blitz: {insights.timeControls.blitz}</Text>
                <Text style={styles.text}>Rapid: {insights.timeControls.rapid}</Text>
                <Text style={styles.text}>Classical: {insights.timeControls.classical}</Text>
              </View>
            </>
          )}

          {/* Accuracy */}
          {isSectionEnabled('accuracy') && (
            <>
              <Text style={styles.subtitle}>Accuracy</Text>
              <Text style={styles.text}>Overall: {Math.round(insights.accuracy.overall)}%</Text>
              <Text style={styles.text}>As White: {Math.round(insights.accuracy.asWhite)}%</Text>
              <Text style={styles.text}>As Black: {Math.round(insights.accuracy.asBlack)}%</Text>
            </>
          )}

          {/* Most Played Openings */}
          {isSectionEnabled('openings') && (
            <>
              <Text style={styles.subtitle}>Most Played Openings</Text>
              {insights.openings.mostPlayed.map((opening, index) => (
                <Text key={index} style={styles.text}>
                  {opening.name} - Played: {opening.count}, Win Rate: {Math.round(opening.winRate)}%
                </Text>
              ))}

              <Text style={styles.subtitle}>Best Performing Openings</Text>
              {insights.openings.bestPerformance.map((opening, index) => (
                <Text key={index} style={styles.text}>
                  {opening.name} - Win Rate: {Math.round(opening.winRate)}%
                </Text>
              ))}
            </>
          )}

          {/* Weaknesses */}
          {isSectionEnabled('weaknesses') && (
            <>
              <Text style={styles.subtitle}>Areas for Improvement</Text>
              {insights.weaknesses.map((weakness, index) => (
                <View key={index}>
                  <Text style={styles.text}>
                    {weakness.phase.charAt(0).toUpperCase() + weakness.phase.slice(1)} Phase:
                  </Text>
                  <Text style={styles.text}>Frequency: {weakness.frequency}</Text>
                  <Text style={styles.text}>Average Eval Drop: {weakness.averageEvalDrop.toFixed(2)}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </Page>
    </Document>
  );
};

export const generateInsightsPDF = (insights: GameInsights, selectedSections: InsightSection[]) => {
  return <InsightsPDF insights={insights} selectedSections={selectedSections} />;
}; 