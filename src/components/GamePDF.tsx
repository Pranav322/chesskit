import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { Game } from "@/types/game";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  metadata: {
    fontSize: 12,
    marginBottom: 5,
  },
  gameInfo: {
    marginBottom: 15,
  },
  players: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  notesTitle: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "bold",
  },
  notesText: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  tag: {
    fontSize: 10,
    backgroundColor: "#e3f2fd",
    padding: "4 8",
    marginRight: 5,
    marginBottom: 5,
    borderRadius: 4,
  },
  moves: {
    marginTop: 20,
    fontSize: 12,
    lineHeight: 1.5,
  },
});

interface GamePDFProps {
  game: Game;
}

export const GamePDF = ({ game }: GamePDFProps) => {
  // Extract moves from PGN (everything after the header section)
  const moves = game.pgn.split(/\n\n/g).slice(-1)[0];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Chess Game Analysis</Text>
          <Text style={styles.metadata}>Event: {game.event || "Casual Game"}</Text>
          <Text style={styles.metadata}>Date: {game.date || "Unknown Date"}</Text>
          <Text style={styles.metadata}>Site: {game.site || "Unknown Site"}</Text>
        </View>

        <View style={styles.gameInfo}>
          <View style={styles.players}>
            <Text>
              White: {game.white.name} ({game.white.rating || "Unrated"})
            </Text>
            <Text>vs</Text>
            <Text>
              Black: {game.black.name} ({game.black.rating || "Unrated"})
            </Text>
          </View>
          <Text>Result: {game.result}</Text>
        </View>

        {game.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Game Notes:</Text>
            <Text style={styles.notesText}>{game.notes}</Text>
          </View>
        )}

        {game.tags && game.tags.length > 0 && (
          <View>
            <Text style={styles.notesTitle}>Tags:</Text>
            <View style={styles.tags}>
              {game.tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View style={styles.moves}>
          <Text style={styles.notesTitle}>Game Moves:</Text>
          <Text>{moves}</Text>
        </View>
      </Page>
    </Document>
  );
}; 