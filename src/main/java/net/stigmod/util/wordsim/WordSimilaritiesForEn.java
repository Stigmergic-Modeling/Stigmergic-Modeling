/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.util.wordsim;

import edu.sussex.nlp.jws.JWS;
import edu.sussex.nlp.jws.WuAndPalmer;
import net.stigmod.domain.conceptualmodel.ValueNode;
import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * @author Kai Fu
 * @version 2016/3/13
 */
public class WordSimilaritiesForEn {

    public static List<List<Double>> vNodeSimList = new ArrayList<>();
    public static WuAndPalmer wup;

    public static void initWuAndPalmer() {
        Config config = ConfigLoader.load();
        String path = config.getWordNetPath();
        JWS ws = new JWS(path, "3.0");
        wup = ws.getWuAndPalmer();
        System.out.println("Wu & palmer\n");
    }

    public static void getVNodeSimListByName(List<ValueNode> valueNodeList) {

        int vSize = valueNodeList.size();
        List<List<String>> nameList = new ArrayList<>();
        for(int i=0;i<vSize;i++) {
            String fullName = valueNodeList.get(i).getName();
            List<String> subNameList = new ArrayList<>();
            int start=0,nameLen=fullName.length();
            for(int j=0;j<nameLen;j++) {
                char ch = fullName.charAt(j);
                if((ch>='A'&&ch<='Z'&&j!=0)||j==nameLen-1) {
                    if(j==nameLen-1) j++;
                    subNameList.add(fullName.substring(start,j).toLowerCase());
                    start=j;
                }
            }
            nameList.add(subNameList);
        }

        for(int i=0;i<vSize;i++) {
            List<Double> simList = new ArrayList<>();
            for(int j=0;j<vSize;j++) {
                if(i==j) simList.add(1.0);
                else {
                    List<String> sourceNameList = nameList.get(i);
                    List<String> targetNameList = nameList.get(j);
                    simList.add(getMaxSimForNameList(sourceNameList,targetNameList));
                }
            }
            vNodeSimList.add(simList);
        }
    }

    private static Double getMaxSimForNameList(List<String> sourceNameList,List<String> targetNameList) {
        double maxSim = 0.0;
        try {
            StringBuffer sourceFullNameWithBlank = new StringBuffer();
            StringBuffer targetFullNameWithBlank = new StringBuffer();
            int sourceSize = sourceNameList.size();
            int targetSize = targetNameList.size();
            for(int i=0;i<sourceSize;i++) {
                sourceFullNameWithBlank.append(sourceNameList.get(i));
                if(i!=sourceSize-1) sourceFullNameWithBlank.append(" ");
            }
            for(int i=0;i<targetSize;i++) {
                targetFullNameWithBlank.append(targetNameList.get(i));
                if(i!=targetSize-1) targetFullNameWithBlank.append(" ");
            }
            maxSim = wup.max(sourceFullNameWithBlank.toString(),targetFullNameWithBlank.toString(),"n");
            if(Math.abs(maxSim-0.0)<0.00001 && (sourceSize>1 || targetSize>1)) {
                List<NameSimilarity> nameSimList = new ArrayList<>();
                int minSize = Math.min(sourceSize,targetSize);//获取最小长度
                for(String sourceName : sourceNameList) {
                    for(String targetName : targetNameList) {
                        double sim=wup.max(sourceName,targetName,"n");
                        NameSimilarity nameSimilarity = new NameSimilarity(sourceName,targetName,sim);
                        nameSimList.add(nameSimilarity);
                    }
                }
                Collections.sort(nameSimList, new Comparator<NameSimilarity>() {
                    @Override
                    public int compare(NameSimilarity o1, NameSimilarity o2) {
                        return Double.compare(o2.similarity,o1.similarity)  ;
                    }
                });
                //nameSimList中的数据被排序了,由大到小
                int curSize = 0 , index = 0;//直到curSize等于minSize才行
                List<String> dupNameList = new ArrayList<>();//用来防止重复的name出现
                double targetSim = 0.0;
                while(curSize<minSize) {
                    if(!dupNameList.contains(nameSimList.get(index).sourceName) &&
                            !dupNameList.contains(nameSimList.get(index).targetName)) {
                        targetSim += nameSimList.get(index).similarity;
                        dupNameList.add(nameSimList.get(index).sourceName);
                        dupNameList.add(nameSimList.get(index).targetName);
                        curSize++;
                    }
                    index++;
                }
                maxSim = targetSim/minSize;
            }//暂时先不用这个
        }catch(Exception ex) {
            ex.printStackTrace();
        }
        return maxSim;
    }

    static class NameSimilarity {
        String sourceName;
        String targetName;
        double similarity;

        public NameSimilarity(String sourceName, String targetName, double similarity) {
            this.sourceName = sourceName;
            this.targetName = targetName;
            this.similarity = similarity;
        }
    }
}
