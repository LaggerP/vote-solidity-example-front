import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/VoteContract.json";

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allCandidates, setAllCandidates] = useState([]);

  const contractAddress = "0x3Bdf77f4FaA34bb7F4769c083343F564f4124baa";
  const contractABI = abi.abi;

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log(accounts);
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCandidatesToVote = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const votePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const candidates = await votePortalContract.getCandidates();
        console.log("traigo candidatos", candidates);
        let candidatesList = [];
        candidates.forEach((candidate) => {
          console.log("candidatos", candidate);
          candidatesList.push({
            name: candidate.name,
            voteCount: candidate.voteCount,
          });
        });

        /*
         * Store our data in React State
         */
        setAllCandidates(candidatesList);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const newVote = async (index) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const votePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const voteTxn = await votePortalContract.vote(index, {
          gasLimit: 300000,
        });
        console.log("Mining...", voteTxn.hash);

        await voteTxn.wait();
        console.log("Mined -- ", voteTxn.hash);

        await getCandidatesToVote();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getCandidatesToVote();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h4>¿La menta es un buen sabor de helado?</h4>
        </div>

        {!currentAccount && (
          <button className="Wallet-btn" onClick={connectWallet}>
            Conectar Wallet mediante Rinkeby para poder ver las opciones
          </button>
        )}
        {currentAccount && (
          <>
            <div className="Card-container">
              {allCandidates.map((candidate, index) => {
                console.log(candidate.voteCount.toNumber());
                return (
                  <div
                    className="Card"
                    key={index}
                    onClick={() => newVote(index)}
                  >
                    <h5>
                      {candidate.name}
                      {candidate.name === "Si" ? "😍" : "🤢"}(
                      {candidate.voteCount.toNumber()} votos)
                    </h5>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div>
          <p className="Text-testnet-info">
            Esta página hace uso de la testnet Rinkeby (red de prueba). Esto
            significa que tus ethers no se ven afectados, igualmente se
            recomienda NO conectar tu wallet personal.{" "}
            <strong style={{ color: "red" }}>
              ¡Usa una que no ponga en riesgo tus criptoactivos!
            </strong>
          </p>
          <p className="Text-testnet-info">
            Código disponible: <a href="https://github.com/LaggerP/vote-solidity-example">Contrato</a> | <a href="https://github.com/LaggerP/vote-solidity-example-front">Front end</a>
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;
