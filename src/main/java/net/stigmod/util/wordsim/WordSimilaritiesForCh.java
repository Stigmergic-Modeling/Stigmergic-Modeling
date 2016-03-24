/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.util.wordsim;


import net.stigmod.domain.conceptualmodel.ValueNode;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * @author Kai Fu
 * @version 2016/3/23
 */
public class WordSimilaritiesForCh {
    public static List<List<Double>> vNodeSimList = new ArrayList<>();

    public static void initDict() {
        WordSimilarityForCh.loadGlossary();
    }

    public static void getVNodeSimListByName(List<ValueNode> valueNodeList) {

        int vSize = valueNodeList.size();
//        List<String> nameList = new ArrayList<>();
        for(int i=0;i<vSize;i++) {
            String fullName = valueNodeList.get(i).getName();
            WordSimilarityForCh.isHaveWord(fullName);
        }

        for(int i=0;i<vSize;i++) {
            List<Double> simList = new ArrayList<>();
            String fullName = valueNodeList.get(i).getName();
            for(int j=0;j<vSize;j++) {
                if(i==j) simList.add(1.0);
                else {
                    String otherFullName = valueNodeList.get(j).getName();
                    simList.add(WordSimilarityForCh.simWord(fullName,otherFullName));
                }
            }
            vNodeSimList.add(simList);
        }
    }

}
