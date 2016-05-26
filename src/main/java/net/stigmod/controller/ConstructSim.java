package net.stigmod.controller;

import edu.sussex.nlp.jws.JWS;
import edu.sussex.nlp.jws.WuAndPalmer;
import net.didion.jwnl.JWNL;
import net.didion.jwnl.JWNLException;
import net.didion.jwnl.dictionary.*;
import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;

import java.io.*;
import java.net.URL;
import java.util.*;

/**
 * Created by qrr on 16/5/23.
 */
class NodeForSim {
    public String nodeId = null;
    public String nodeName = null;
}
public class ConstructSim {


    public static void main(String args[]) throws IOException {

        WuAndPalmer wup;
        edu.sussex.nlp.jws.Path pathLength;
        MorphologicalProcessor morph;
//        Config config = ConfigLoader.load();
//        String path = config.getWordNetPath();
        JWS ws = new JWS("/Users/qrr/Desktop/wordnet", "3.0");


        String Path = "/Users/qrr/Desktop/Data/";
        int graphNum = 3;

        List<List<NodeForSim>> graphs = new ArrayList();

        for(int i = 0; i < graphNum; i ++) {
            String curFileName = (char)('a' + i) + "Nodes";
            System.out.println(curFileName);
            File file = new File(Path + curFileName);
            InputStreamReader inreader = new InputStreamReader(new FileInputStream(file));
            BufferedReader br = new BufferedReader(inreader);
            String line =  br.readLine();

            List<NodeForSim> curGraph = new ArrayList();
            while(line != null) {

                String[] strs = line.split("\t");
                NodeForSim curNode = new NodeForSim();
                curNode.nodeId = strs[0];
                System.out.println(strs[0]);
                if (strs[0].charAt(0) == 'V') {
                    curNode.nodeName = strs[1];
                    System.out.println(strs[1]);
                }
                curGraph.add(curNode);
                line = br.readLine();
            }
            inreader.close();
            br.close();
            graphs.add(curGraph);
        }

        for(int i = 0; i < graphNum; i ++) {
            for(int j = i + 1; j < graphNum; j ++) {

                String simFileName = (char)('a' + i) + "-" + (char)('a' + j) + ".sim";
                File fileSim = new File(Path + simFileName);
                FileOutputStream outSim = new FileOutputStream(fileSim);

                for(int m = 0; m < graphs.get(i).size(); m ++) {

                    NodeForSim firstNode = graphs.get(i).get(m);

                    for(int n = 0; n < graphs.get(j).size(); n ++) {

                        NodeForSim secondNode = graphs.get(j).get(n);
                        if(firstNode.nodeId.charAt(0) == secondNode.nodeId.charAt(0)) {
                            double curSim = 1.0;
                            if(firstNode.nodeId.charAt(0) == 'V') {
                                if(firstNode.nodeName.equals("true")) {
                                    if(!secondNode.nodeName.equals("true"))
                                        curSim = 0.0;
                                }
                                else if(firstNode.nodeName.equals("false")) {
                                    if(!secondNode.nodeName.equals("false"))
                                        curSim = 0.0;
                                }
                                else if(firstNode.nodeName.equals("*")) {
                                    if(secondNode.nodeName.equals("*"))
                                        curSim = 1.0;
                                    else if(secondNode.nodeName.equals("1..*"))
                                        curSim = 0.5;
                                    else
                                        curSim = 0.0;
                                }
                                else if(firstNode.nodeName.equals("1..*")) {
                                    if(secondNode.nodeName.equals("1..*"))
                                        curSim = 1.0;
                                    else if(secondNode.nodeName.equals("*"))
                                        curSim = 0.5;
                                    else
                                        curSim = 0.0;
                                }
                                else {
                                    if(secondNode.nodeName.equals("true") || secondNode.nodeName.equals("false")
                                            || secondNode.nodeName.equals("*") || secondNode.nodeName.equals("1..*"))
                                        curSim = 0.0;
                                    else {
                                        wup = ws.getWuAndPalmer();
                                        pathLength = ws.getPath();

//                                        double simWup1 = wup.max(firstNode.nodeName, secondNode.nodeName, "n");
//                                        double simWup2 = wup.max(firstNode.nodeName, secondNode.nodeName, "v");
//                                        double wupSim = Math.max(simWup1, simWup2);

                                        double wupSim = 0.0;

                                        double simPath1 = pathLength.max(firstNode.nodeName, secondNode.nodeName, "n");
                                        double simPath2 = pathLength.max(firstNode.nodeName, secondNode.nodeName, "v");
                                        double pathSim = Math.max(simPath1, simPath2);

                                        curSim = (wupSim + pathSim) / 2.0;

                                    }
                                }
                            }
                            if(curSim != 0.0) {
                                String outputSim = firstNode.nodeId + "\t" + secondNode.nodeId + "\t" + curSim + "\n";
                                outSim.write(outputSim.getBytes());
                            }
                        }
                    }
                }

                outSim.close();
            }
        }

        System.out.println("Hello World!");
    }
}
