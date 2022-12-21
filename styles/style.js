import { StyleSheet } from "react-native";
import { Colors } from "./color";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 30,
    justifyContent: "space-between",
  },
  containerCenter: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    marginTop: 20,
  },
  flexHorizontal: {
    flexDirection: "row",
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  boldText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  header: { fontSize: 30, fontWeight: "bold", marginBottom: 10 },
  button: {
    borderRadius: 40,
    padding: 10,
    backgroundColor: Colors.defaultIOSBlue,
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 17,
    color: Colors.black,
  },
  input: {
    borderColor: Colors.black,
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
    color: Colors.black,
  },

  /************ Main Page *****************/
  pressableCard: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: -1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginVertical: 5,
  },
  horizontalCardContainer: {
    flexDirection: "row",
    alignContent: "center",
  },
  cardImg: { width: 150, height: 150 },
  cardBody: { flex: 1, flexDirection: "column" },
  cardTitleText: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 10,
    color: Colors.white,
  },
  cardTitleOnlyText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardBodyText: {
    flex: 2,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 10,
    color: Colors.white,
  },
  mainFooterBtn: {
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
  },
  mainFooterBtnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
  },

  /*********** ClacTransit page **************/
  transitOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  transitEtaText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  transitArrivalTime: {
    fontWeight: "bold",
  },
  transitTag: {
    backgroundColor: Colors.grey,
    padding: 5,
    borderRadius: 2,
    borderWidth: 0.2,
    borderColor: Colors.black,
  },
  transitTagNS: {
    backgroundColor: Colors.NS,
  },
  transitTagNE: {
    backgroundColor: Colors.NE,
  },
  transitTagEW: {
    backgroundColor: Colors.EW,
  },
  transitTagCC: {
    backgroundColor: Colors.CC,
  },
  transitTagDT: {
    backgroundColor: Colors.DT,
  },
  transitTagTE: {
    backgroundColor: Colors.TE,
  },
  transitTagTo: {
    padding: 5,
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  transitTagText: {
    color: Colors.white,
  },
  transitText: {
    fontSize: 16,
  },

  /********** Direction Page Stylings *************/
  directionWindow: {
    borderRadius: 10,
    borderWidth: 5,
    borderColor: Colors.primary,
    zIndex: 20,
    position: "absolute",
    bottom: 20,
    width: "90%",
    backgroundColor: Colors.white,
  },
  directionWindowHeader: {
    width: "100%",
    backgroundColor: Colors.primary,
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  directionWindowBtn: {
    textAlign: "center",
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  directionWindowHeaderText: {
    textAlign: "center",
    color: Colors.white,
    fontSize: 17,
    fontWeight: "bold",
  },
  directionContainer: {
    paddingVertical: 5,
    borderBottomWidth: 0.3,
    borderColor: Colors.black,
  },
  directionText: {
    fontSize: 16,
    marginLeft: 20,
  },
});
